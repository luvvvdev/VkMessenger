import {createModel} from "@rematch/core";
import {RootModel} from "../index";
import {GetHistoryResult} from "../../services/api";
import * as Objects from "../../types/vk/objects";
import {Message} from "../../entities/Message";
import {Conversation} from "../../entities/Conversation";
import {MessagesMessage} from "../../types/vk/objects";
import lodash from 'lodash'

type MessagesMessageWithLoadedStatus = MessagesMessage & {loaded?: boolean}

type History = {
    count: number;
    [key: string]: any;
    items: MessagesMessageWithLoadedStatus[];
    profiles?: Objects.UsersUserFull[];
    groups?: Objects.GroupsGroupFull[];
    conversations?: Conversation[];
}

export interface HistoryState {
    items: {
        [peer_id: number]: History
    }
    current_id: number | null
}

export type HistoryGetEffect = {
    peer_id: number
    offset: number
    count?: number
}

const initialState: HistoryState = {
    items: [],
    current_id: null,
}

type UpdateHistoryReducerPayload = {
    peer_id: number
    history: History
}

const history = createModel<RootModel>()({
    state: initialState,
    reducers: {
        reset: () => (initialState),
        update: (state, payload: HistoryState) => (payload),
        push: (state, payload: {peer_id: number, history: any}) => ({...state, current_id: payload.peer_id, items: {...state.items, [payload.peer_id]: payload.history} }),
        clear: (state, payload: {peer_id: number}) => {
            const newItems = state.items
            delete newItems[payload.peer_id]

            return ({...state, items: newItems})
        },
        clearLoaded: (state, payload: {peer_id: number}) => {
            const newItems = state.items
            const conversationItems = newItems[payload.peer_id].items

            conversationItems.slice(0, conversationItems.length - 200)

            newItems[payload.peer_id].items = conversationItems

            return ({...state, items: newItems})
        },
        setCurrentId: (state, payload: {peer_id: number | null}) => ({...state, current_id: payload.peer_id}),
        addMessage: (state, {message}: {message: MessagesMessage}) => {
            const targetHistory = state.items[message.peer_id]

            if (!targetHistory) return state

            return {...state, items: {[message.peer_id]: {...state.items[message.peer_id], count: state.items[message.peer_id].count + 1, items: [message, ...state.items[message.peer_id].items]}}}
        },
        setMessageLoading: (state, {peer_id, msg_id, rid}: {peer_id: number, msg_id: number, rid: number}) => {
            const targetHistory = state.items[peer_id]
            const targetHistoryMessages = targetHistory.items

            const targetMsgIndex = lodash.findIndex(targetHistoryMessages, (v) => v.id === rid)

            console.log('target msg index to set loaded', targetMsgIndex)

            if (!Number.isInteger(targetMsgIndex)) return state

            targetHistoryMessages[targetMsgIndex].loaded = true
            targetHistoryMessages[targetMsgIndex].id = msg_id
            console.log('Set loaded to true for ', msg_id)

            return {...state, items: {...state.items, [peer_id]: {...targetHistory, items: targetHistoryMessages}}}
        },
    },
    effects: (dispatch) => ({
        get: async (payload: HistoryGetEffect, state) => {
            // console.log(Object.keys(state.history.items).map((key) => ({key, length: state.history.items[key].items.length})))

            try {
                const neededHistory = state.history.items[payload.peer_id]

                // if items already loaded skip loading
                if (neededHistory && (!payload.offset || payload.offset === 0)) return

                const startMessageId = neededHistory && neededHistory.items.length > 0 && (!payload.offset || payload.offset === 0) ? neededHistory.items[neededHistory.items.length - 1].id : undefined

               /* if (state.history.current_id) {
                    dispatch.history.clear({peer_id: state.history.current_id})
                } */


                const historyResponse: GetHistoryResult = await global.api.getHistory(
                    payload.peer_id,
                    payload.offset,
                    payload.count,
                    startMessageId)

                if (historyResponse.kind !== 'ok' || !historyResponse.data.response) return

                const data = historyResponse.data.response

                //data.conversations = historyResponse.data.response.conversations?.map((c) => new ConversationScreen(c))
                // data.items = historyResponse.data.response.items.map((m) => new Message(m))

                console.log('offset', payload.offset)

                // if (data.items && data.items.length === 0) return

                dispatch.history.push({
                    peer_id: payload.peer_id,
                    history: {
                        ...data,
                        // count: neededHistory.count && payload.offset > 0 && payload.count ? neededHistory.items.length + payload.count : data.count,
                        items: [...(payload.offset > 0 || (neededHistory && neededHistory.items.length > 0) ? (data.items.length > 0 ? [...neededHistory.items, ...data.items] : neededHistory.items) : data.items)]}
                })

            } catch (e) {
                console.error(e)
                throw e
            }
        },
        loadMore: async (payload: {count?: number}, state) => {
            // console.log('loadMore start', state.history, state.history.items[state.history.current_id!])

            if (!state.history.current_id) return

            const currentPeer = state.history.items[state.history.current_id]

            if (!currentPeer || currentPeer.items.length >= currentPeer.count) return

            const offset = state.history.items[state.history.current_id].items.length

            console.log('loadMore offset', offset)

            await dispatch.history.get({offset, count: 200, peer_id: state.history.current_id} as HistoryGetEffect)
        },
        sendMessage: ({message}: {message: MessagesMessage}, state) => {
            console.log('trying to send message with id', message.id)

            dispatch.history.addMessage({message: {...message, loaded: false}})

            global.api.sendMessage(message.peer_id, message.text, message.random_id)
/*
            if (response.kind !== 'ok' || !response.data.response) return

            // const messageId: number = response.data

            const history = state.history.items[message.peer_id]

            const loadingMessageId = history.items.findIndex(m => m.id === message.id)
            const loadingMessage = history[loadingMessageId]

            if (loadingMessage) {
                console.log('found loading message', loadingMessage)
                loadingMessage.loading = false
                // loadingMessage.id = messageId

            } else {
                console.log('loading message not found', loadingMessage)
                // loadingMessage.error = true
                return
            }

            await dispatch.history.addMessage({message: loadingMessage})*/

            //const newMessage = new Message({id: messages[0].id + 1, peer_id: peerId, from_id: myId, text: textMessage, date: Date.now(), attachments: []} as MessagesMessage)
            //newMessage.loading = true

            //messages = [newMessage, ...messages]
            // dispatch.history.
        }
    })

})


export {history}
