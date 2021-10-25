import {DeviceEventEmitter, DeviceEventEmitterStatic} from "react-native";
import {Api} from "../api/api";
import {Store, store} from "../../models";
import {Message} from "../../entities/Message";
import _ from 'lodash'
type TLongPollActions = 'lp_service_init' | TLongPollConnectionActions | TLongPollUpdatesActions
type TLongPollConnectionActions = 'lp_server_connect' | 'lp_server_connect_ok' | 'lp_server_connect_failed' | 'lp_server_reconnect'
type TLongPollUpdatesActions = 'lp_updates_check' | 'lp_updates_check_failed' | 'lp_updates_check_ok' | 'update'

enum TLongPollUpdates
{
    SET_FLAGS = 2,
    RESET_FLAGS = 3,
    NEW_MESSAGE = 4,
    EDIT_MESSAGE = 5,
    READ_IN_MESSAGES = 6,
    READ_OUT_MESSAGES = 7,
    FRIEND_ONLINE = 8,
    FRIEND_OFFLINE = 9,
    RESET_CHAT_FLAGS = 10,
    SET_CHAT_FLAGS = 12,
    DELETE_ALL_MESSAGES = 13,
    CHANGE_MESSAGE = 18,
    RESET_CACHE_MESSAGE = 19,
    EDIT_CHAT = 52,
    TYPING = 63,
    VOICING = 64,
    UNREAD_COUNT_UPDATE = 80,
    CALLBACK_BUTTON_RESPONSE = 119
}

class LongPollError extends Error {
    constructor(...params: string[]) {
        super();

        this.message = `[LongPoll Error] ${[...params.map((v) => v + ' ')]}`
    }
}

/**
 * @class
 * Класс для работы с LongPoll ВК
 * Для запуска работы следует вызвать метод connect()
 * Затем для дальнейшего отслеживания и обработки обновлений lookupUpdates()
 * @example
 *   const lp = new LongPollService()
 *
 *   global.lp = lp
 *
 *   try {
        await global.lp.connect()
        await global.lp.lookupUpdates()
    } catch (e) {
        console.error(e)
    }
 * */
class LongPollService {
    private api: Api

    private server: string | null = null
    private key: string | null = null
    private ts: number | null = null
    private failed?: number | null = null

    private updates: any[] = []
    private retries: number

    private store: Store

    private emitter: DeviceEventEmitterStatic

    active: boolean = false

    constructor() {

        this.emitter = DeviceEventEmitter

        this.emit('lp_service_init')

        this.api = global.api
        this.store = store
    }

    async connect() {
        this.emit('lp_server_connect')

        const userStore = store.getState().user
        if (!userStore.login_data || !userStore.user_data) return

        try {
            const response = await this.api.getLongPollServer()

            // console.log(serverData)

            if (response.kind !== 'ok' || response.data.error) {

                console.log(response)
                // @ts-ignore
                throw new LongPollError('Failed connection', JSON.stringify(response))
            }

            // @ts-ignore
            const {server, key, ts} = response.data.response

            this.server = server
            this.key = key
            this.ts = ts
            this.failed = null


            this.emit('lp_server_connect_ok', {server, key, ts})

            return
        } catch (error) {
            console.error(error)
            return this.reconnect(error, 'lp_server_connect_failed')
        }
    }

    private reconnect(error: Error, event: TLongPollActions) {
        this.emit(event, error)

        const retry = setInterval(async () => {
            if (this.retries === 3 || !this.failed) {
                this.emit(event, error)

                this.active = false
                return clearInterval(retry)
            }

            this.retries += 1

            this.emit('lp_server_reconnect', {retries: this.retries, reason: error, event})

            await this.connect()
        }, 5000)
    }

    private onUpdates({ts, updates}: {ts: number, updates: Array<any[]>}) {
        this.ts = ts
        this.updates = updates || []

        this.emit('lp_updates_check_ok', {ts, updates})

        this.handleUpdates(updates)
    }

    private onNewMessage(message: Message) {
        console.log('New MessageItem', message)

        this.store.dispatch.conversations.editLastMessage({message}).catch((e) => {
            console.error(e)
        })

        const messageHistory = this.store.getState().history.items[message.peer_id]

        if (!messageHistory) return

        const loadingMessageIndex = _.findIndex(messageHistory.items, (v) => v.id === message.random_id)

        if (loadingMessageIndex === -1) {
            console.log('message hasnt loading instance')

            this.store.dispatch.history.addMessage({message})
            return
        }

        console.log('message has loading instance', message.id)

        //messageHistory.items[loadingMessageIndex].loading = false

        this.store.dispatch.history.setMessageLoading({peer_id: message.peer_id, msg_id: message.id, rid: message.random_id!})
    }

    private onEditMessage(message: Message) {

    }

    private onReadMessage(readState) {

    }

    private onTyping(typingEvent) {

    }

    private handleUpdates(updates: Array<any[]>) {
        if (updates.length === 0) return

        //const state: RootState = store.getState()

        new Promise<void>((resolve) => {
            const messages = updates.filter((event) => event[0] === TLongPollUpdates.NEW_MESSAGE || event[0] === TLongPollUpdates.EDIT_MESSAGE)
            // const basic = messages.filter((event) => Object.keys(event[7]).includes('source_act'))

            if (messages.length > 0) {
                messages.forEach((message) => {
                    const msg = new Message(message)

                    if (message[0] === TLongPollUpdates.NEW_MESSAGE) this.onNewMessage(msg)
                    else this.onEditMessage(msg)

                    resolve()
                })
            }
        })

        new Promise<void>((resolve) => {
            const readStates = updates.filter(event => event[0] === TLongPollUpdates.READ_IN_MESSAGES || event[0] === TLongPollUpdates.READ_OUT_MESSAGES).map((event) => ({peer_id: event[1], message_id: event[2], unread: event[3]}))

            if (readStates.length > 0) readStates.forEach((readState) => this.onReadMessage(readState))

            resolve()
        })

        new Promise<void>(resolve => {
            const typings = updates.filter(event => event[0] === TLongPollUpdates.TYPING).filter(event => ({peer_id: event[0], user_ids: event[2]}))

            if (typings.length > 0) {
                typings.forEach(event => this.onTyping(event))

                resolve()
            }
        })

        return
    }

    private async getHistoryUpdates() {
        const response = await this.api.getLongPollHistory({ts: this.ts!, lp_version: 12})

        console.log('this.getHistoryUpdates()', response)
    }

    // call it only if connected
    private async getUpdates() {
        const updatesResponse = await this.api.getLongPollUpdates(this.server!, this.key!, this.ts!)

        // console.log(updatesResponse)

        // @ts-ignore
        if (updatesResponse.kind === 'timeout') {
            return await this.getUpdates()
        }

        if (updatesResponse.kind !== 'ok' || !updatesResponse.data) {
            throw new LongPollError(`LongPoll updating request error`, JSON.stringify(updatesResponse))
        }

        if (updatesResponse.data.failed) {
            this.failed = updatesResponse.data.failed

            switch (updatesResponse.data?.failed) {
                case 2 || 3:
                    new Error('Failed to get updates (maybe problem of server)')
                    break
                case 4:
                    throw new Error('Invalid LongPoll version number')
                    break
                default:
                    throw new Error('Unknown error')
                    break
            }
        }

        const {ts, updates} = updatesResponse.data

        return {ts, updates}
    }

    async lookupUpdates() {
        // console.log(this.active, this.server, this.failed, this.ts)
        if (!this.server || this.failed) return

        // console.log(this.active)
        if (!this.active) await this.getHistoryUpdates()

        this.active = true

        try {
            this.emit('lp_updates_check')

            const {ts, updates} = await this.getUpdates()

            await this.onUpdates({ts, updates: updates || []})

            await this.lookupUpdates()
        } catch (error) {
            const userStore = store.getState().user
            if (!userStore.login_data || !userStore.user_data) return

            if (this.failed === 4) return console.error(error)
            return this.reconnect(error, 'lp_updates_check_failed')
        }
    }

    offAll(event?: TLongPollActions) {
       return this.emitter.removeAllListeners(event)
    }

    on(eventName: TLongPollActions, listener: (...args: any[]) => void) {
        return this.emitter.addListener(eventName, listener)
    }

    private emit(eventType: TLongPollActions, ...params: any[]) {
        return this.emitter.emit(eventType, ...params)
    }
}

export {LongPollService}
