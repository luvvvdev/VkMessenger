import {createModel} from "@rematch/core";
import {RootModel} from "../index";
import {GetHistoryResult} from "../../services/api";
import * as Objects from "../../types/vk/objects";
import {Message} from "../../entities/Message";
import {Conversation} from "../../entities/Conversation";
import {MessagesMessage} from "../../types/vk/objects";

type History = {
    count: number;
    [key: string]: any;
    items: MessagesMessage[];
    profiles?: Objects.UsersUserFull[];
    groups?: Objects.GroupsGroupFull[];
    conversations?: Conversation[];
}

export interface HistoryState {
    items: {
        [peer_id: number]: History
    }
    current_id: number | null
    loading: boolean
}

export type HistoryGetEffect = {
    peer_id: number
    offset: number
    count?: number
}

const initialState: HistoryState = {
    items: [],
    current_id: null,
    loading: false
}

type UpdateHistoryReducerPayload = {
    peer_id: number
    history: History
}

const history = createModel<RootModel>()({
    state: initialState,
    reducers: {
        reset: () => (initialState),
        update: (state, payload: UpdateHistoryReducerPayload) => {
            const updatedItems = state.items
            updatedItems[payload.peer_id] = payload.history

            return ({...state, current_id: state.current_id, items: updatedItems})
        },
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
        addMessage: (state, {message}: {message: Message}) => {
            // console.log('add new message to history', message)
            if (message.peer_id !== state.current_id) {
                // console.log('unable to add new message')
                return state
            }

            /* const existsMessageIndex = state.items[message.peer_id].items.findIndex((m) => m.id === message.id)
            // const existsMessage = state.items[message.peer_id].items[existsMessageIndex]

            if (existsMessageIndex > 0) {
                console.log('message is exists')
                delete state.items[message.peer_id].items[existsMessageIndex]
                state.items[message.peer_id].items[existsMessageIndex] = message

                // return {...state, items: {[message.peer_id]: {...state.items[message.peer_id], count: state.items[message.peer_id].items.length + 1, items: [message, ...state.items[message.peer_id].items]}}}
            }*/

            return {...state, items: {[message.peer_id]: {...state.items[message.peer_id], count: state.items[message.peer_id].items.length + 1, items: [message, ...state.items[message.peer_id].items]}}}
        },
        setLoading: (state, payload: boolean) => ({...state, loading: payload})
    },
    effects: (dispatch) => ({
        get: async (payload: HistoryGetEffect, state) => {
            try {
                const neededHistory = state.history.items[payload.peer_id]
                const startMessageId = neededHistory && neededHistory.items.length > 0 && (!payload.offset || payload.offset === 0) ? neededHistory.items[neededHistory.items.length - 1].id : undefined

                dispatch.history.setLoading(!startMessageId)
               /* if (state.history.current_id) {
                    dispatch.history.clear({peer_id: state.history.current_id})
                } */


                const historyResponse: GetHistoryResult = await global.api.getHistory(
                    payload.peer_id,
                    payload.offset,
                    payload.count,
                    startMessageId)

                console.log('smid', startMessageId)

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

                dispatch.history.setLoading(false)
            } catch (e) {
                dispatch.history.setLoading(false)
                console.error(e)
                throw e
            }
        },
        loadMore: async (payload: {count?: number}, state) => {
            // console.log('loadMore start', state.history, state.history.items[state.history.current_id!])
            if (!state.history.current_id || !state.history.items[state.history.current_id]) return

            const offset = state.history.items[state.history.current_id].items.length

            console.log('loadMore offset', offset)

            await dispatch.history.get({offset, count: 200, peer_id: state.history.current_id} as HistoryGetEffect)
        },
        sendMessage: async ({message}: {message: Message}, state) => {
            console.log('trying to send message with id', message.id)
            message.loading = true

            await dispatch.history.addMessage({message})

            const response = await global.api.sendMessage(message.peer_id, message.text)

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

            await dispatch.history.addMessage({message: loadingMessage})
            //const newMessage = new Message({id: messages[0].id + 1, peer_id: peerId, from_id: myId, text: textMessage, date: Date.now(), attachments: []} as MessagesMessage)
            //newMessage.loading = true

            //messages = [newMessage, ...messages]
            // dispatch.history.
        }
    })

})


export {history}
