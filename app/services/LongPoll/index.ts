import { Alert, DeviceEventEmitter, DeviceEventEmitterStatic } from "react-native"
import { Api } from "../api/api"
import { Store, store } from "../../models"
import { Message } from "../../entities/Message"
import _ from "lodash"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { MessagesGetLongPollHistoryResponse, MessagesMessage } from "../../types/vk"
type TLongPollActions = "lp_service_init" | TLongPollConnectionActions | TLongPollUpdatesActions
type TLongPollConnectionActions =
  | "lp_server_connect"
  | "lp_server_connect_ok"
  | "lp_server_connect_failed"
  | "lp_server_reconnect"
type TLongPollUpdatesActions =
  | "lp_updates_check"
  | "lp_updates_check_failed"
  | "lp_updates_check_ok"
  | "update"

enum TLongPollUpdates {
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
  CALLBACK_BUTTON_RESPONSE = 119,
}

class LongPollError extends Error {
  constructor(...params: string[]) {
    super()

    this.message = `[LongPoll Error] ${[...params.map((v) => v + " ")]}`
  }
}

type ServerCredentials = { server?: string; key?: string; ts?: number; pts?: number }

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

  private server?: string
  private key?: string
  private ts?: number
  private pts?: number

  private failed?: number

  private updates: any[] = []
  private retries: number

  private store: Store

  private emitter: DeviceEventEmitterStatic

  active: boolean = false

  constructor() {
    this.emitter = DeviceEventEmitter

    this.api = global.api
    this.store = store
  }

  async saveTs(ts?: number) {
    await AsyncStorage.setItem("lp_ts", `${ts}`)
  }

  async getTs(): Promise<number | null> {
    const storageTs = Number(await AsyncStorage.getItem("lp_ts")) || null

    return storageTs
  }

  async savePts(pts?: number) {
    await AsyncStorage.setItem("lp_pts", `${pts}`)
  }

  async getPts(): Promise<number | null> {
    const storagePts = Number(await AsyncStorage.getItem("lp_pts")) || null

    return storagePts
  }

  async isServerCredsStored() {
    const is = await AsyncStorage.getItem("lp_creds_saved")

    return is ? Boolean(is) : false
  }

  async saveServerCredsToStorage(credentials: ServerCredentials) {
    await AsyncStorage.setItem("lp_creds_saved", `${true}`)

    await Promise.all(
      Object.keys(credentials).map(async (key) => {
        await AsyncStorage.setItem(`lp_${key}`, `${credentials[key]}`)
      }),
    )
  }

  async getStorageServerCreds(keys: string[]): Promise<ServerCredentials | null> {
    const creds: ServerCredentials = {}

    await Promise.all(
      keys.map(async (key) => {
        const value = await AsyncStorage.getItem(`lp_${key}`)

        creds[key] = Number(value) ? Number(value) : String(value)
      }),
    )

    return Object.keys(creds).length === 0 ? null : creds
  }

  async saveServer(creds: ServerCredentials) {
    Object.keys(creds).forEach((key) => {
      this[key] = creds[key]
    })

    await this.saveServerCredsToStorage(creds)
  }

  async getServerCredentials(): Promise<ServerCredentials> {
    this.emit("lp_server_connect")

    const userStore = store.getState().user

    if (!userStore.login_data || !userStore.user_data) {
      throw new LongPollError("User not authenticated")
    }

    try {
      const response = await this.api.getLongPollServer()

      if (response.kind !== "ok" || response.data.error) {
        console.warn(response)
        // @ts-ignore
        throw new LongPollError("Failed connection", JSON.stringify(response))
      }

      // @ts-ignore
      const { server, key, ts, pts } = response.data.response

      return { server, key, ts, pts }
    } catch (error) {
      return { server: this.server, key: this.key, ts: this.ts, pts: this.pts }
    }
  }

  onReconnected = () => {}

  private async onUpdates({ ts, updates }: { ts: number; updates: Array<any[]> }) {
    this.ts = ts
    this.updates = updates || []

    this.emit("lp_updates_check_ok", { ts, updates })

    this.store.dispatch.longpoll.setUpdating(true)

    await this.handleUpdates(updates)

    this.store.dispatch.longpoll.setUpdating(false)
  }

  private onNewMessage(message: Message) {
    console.log("New MessageItem", message)

    setTimeout(
      () =>
        this.store.dispatch.conversations.editLastMessage({ message }).catch((e) => {
          console.error(e)
        }),
      500,
    )

    const messageHistory = this.store.getState().history.items[message.peer_id]

    if (!messageHistory) return

    const loadingMessageIndex = _.findIndex(messageHistory.items, (v) => v.id === message.random_id)

    if (loadingMessageIndex === -1) {
      console.log("message hasnt loading instance")

      this.store.dispatch.history.addMessage({ message })
      return
    }

    console.log("message has loading instance", message.id)

    //messageHistory.items[loadingMessageIndex].loading = false

    this.store.dispatch.history.setMessageLoading({
      peer_id: message.peer_id,
      msg_id: message.id,
      rid: message.random_id!,
    })
  }

  private onEditMessage(message: Message) {}

  private onReadMessage(readState) {}

  private onTyping(typingEvent) {}

  private handleUpdates(updates: Array<any[]>) {
    if (updates.length === 0) return

    //const state: RootState = store.getState()

    new Promise<void>((resolve) => {
      const messages = updates.filter(
        (event) =>
          event[0] === TLongPollUpdates.NEW_MESSAGE || event[0] === TLongPollUpdates.EDIT_MESSAGE,
      )
      // const basic = messages.filter((event) => Object.keys(event[7]).includes('source_act'))

      if (messages.length > 0) {
        messages.forEach(async (message) => {
          const msg = new Message()
          await msg.fromArray(message)

          if (message[0] === TLongPollUpdates.NEW_MESSAGE) this.onNewMessage(msg)
          else this.onEditMessage(msg)

          resolve()
        })
      }
    })

    new Promise<void>((resolve) => {
      const readStates = updates
        .filter(
          (event) =>
            event[0] === TLongPollUpdates.READ_IN_MESSAGES ||
            event[0] === TLongPollUpdates.READ_OUT_MESSAGES,
        )
        .map((event) => ({ peer_id: event[1], message_id: event[2], unread: event[3] }))

      if (readStates.length > 0) readStates.forEach((readState) => this.onReadMessage(readState))

      resolve()
    })

    new Promise<void>((resolve) => {
      const typings = updates
        .filter((event) => event[0] === TLongPollUpdates.TYPING)
        .filter((event) => ({ peer_id: event[0], user_ids: event[2] }))

      if (typings.length > 0) {
        typings.forEach((event) => this.onTyping(event))

        resolve()
      }
    })

    return
  }

  private async getHistoryUpdates() {
    console.log("history load..")
    const state = this.store.getState()

    const creds = await this.getStorageServerCreds(["ts", "pts"])

    if (!creds) return

    if (!creds.ts || !creds.pts) {
      return console.error("historyLoad", "cant get TS or PTS")
    }

    const lastConversation = state.conversations.items[0]

    if (!lastConversation) {
      return
    }

    const lastMessageId = lastConversation.last_message.id

    console.log("last message updates history", lastConversation.last_message)

    const response = await this.api.getLongPollHistory({
      ts: creds.ts,
      pts: creds.pts,
      lp_version: 12,
      msgs_limit: 200,
      events_limit: 1000,
      max_msg_id: lastMessageId,
    })

    if (response.kind !== "ok" || (response.kind === "ok" && !response.data.response)) {
      console.error("history updates error", response)
      return
    }

    console.log("this.getHistoryUpdates()", JSON.stringify(response.data.response))

    const data = response.data.response

    console.log("history data", data?.history)

    await this.saveServerCredsToStorage({ pts: data?.new_pts })

    this.handleHistoryUpdates(data)
  }

  private handleHistoryUpdates = (data: MessagesGetLongPollHistoryResponse | undefined) => {
    this.store.dispatch.longpoll.setUpdating(true)

    if (!data) {
      this.store.dispatch.longpoll.setUpdating(false)
      return
    }

    const dispatch = this.store.dispatch

    const messages = data.messages

    console.log("messages count: ", messages.count)

    if (messages.count > 0) {
      const groupedMessages: { [peer_id: number]: MessagesMessage[] } = _.groupBy(
        messages.items,
        (v: MessagesMessage) => v.peer_id,
      )

      _.forEach(Object.keys(groupedMessages), async (peer_id: number) => {
        const messages = groupedMessages[peer_id]

        messages.forEach((message) => {
          console.log("add message")
          dispatch.history.addMessage({ message })
        })

        const lastMessage = _.last(messages)

        this.store.dispatch.conversations
          .editLastMessage({ message: lastMessage })
          .catch((e) => console.error(e))
      })
    }

    this.store.dispatch.longpoll.setUpdating(false)
  }

  // call it only if connected
  private async getUpdates(): Promise<MessagesGetLongPollHistoryResponse | null> {
    const updatesResponse = await this.api.getLongPollUpdates(this.server!, this.key!, this.ts!)

    if (updatesResponse.kind === "timeout") {
      return null
    }

    if (updatesResponse.kind !== "ok" || !updatesResponse.data) {
      throw new LongPollError(`LongPoll updating request error`, JSON.stringify(updatesResponse))
    }

    const { ts, updates, pts, failed } = updatesResponse.data

    return { ts, updates, pts, failed }
  }

  async connect(rewriteCreds = false) {
    this.store.dispatch.longpoll.setReconnect(true)

    let creds: ServerCredentials

    const hasStoredCreds = await this.isServerCredsStored()

    console.log("hasStoredCreds", hasStoredCreds)

    if (hasStoredCreds && !rewriteCreds) {
      const storedSavedCreds = await this.getStorageServerCreds(["server", "ts", "pts", "key"])

      creds = storedSavedCreds!
    } else {
      const newCreds = await this.getServerCredentials()

      console.log("new creds", newCreds)

      creds = newCreds
    }

    this.store.dispatch.longpoll.setReconnect(false)

    return await this.saveServer(creds)
  }

  async lookupUpdates() {
    if (!this.server) {
      await this.connect()
    }

    while (true) {
      this.active = true

      const lpUpdates = await this.getUpdates()

      if (!lpUpdates) {
        continue
      }

      const { ts, pts, updates, failed } = lpUpdates

      if (failed) await this.handleErrors(failed)

      if (ts) {
        this.ts = ts
        await this.saveTs(ts)
      }

      if (pts) {
        this.pts = pts
        await this.savePts(pts)
      }

      await this.onUpdates({ ts, updates: updates || [] })
    }
  }

  async handleErrors(failed: number) {
    switch (failed) {
      case 1:
        console.warn("Old history of updates, try get")
        await this.getHistoryUpdates()
        break
      case 2:
        console.warn("Property of key is expired, try reconnect")
        await this.connect(true)
        break
      case 3:
        console.warn("Try to reconnect and get new history of updates")
        await this.getHistoryUpdates()
        break
      case 4:
        console.error("Invalid LongPoll version number")
        break
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

export { LongPollService }
