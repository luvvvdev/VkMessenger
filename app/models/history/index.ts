import {createModel} from "@rematch/core";
import {RootModel} from "../index";
import {MessagesGetHistoryExtendedResponse} from "../../types/vk";
import {GetHistoryResult} from "../../services/api";

export interface HistoryState {
    items: {
        [peer_id: number]: MessagesGetHistoryExtendedResponse
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
    current_id: null
}

type UpdateHistoryReducerPayload = {
    peer_id: number
    history: MessagesGetHistoryExtendedResponse
}

const history = createModel<RootModel>()({
    state: initialState,
    reducers: {
        update: (state, payload: UpdateHistoryReducerPayload) => {
            const updatedItems = state.items
            updatedItems[payload.peer_id] = payload.history

            return ({current_id: state.current_id, items: updatedItems})
        },
        push: (state, payload: UpdateHistoryReducerPayload) => ({current_id: payload.peer_id, items: {...state.items, [payload.peer_id]: payload.history} }),
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
        }
    },
    effects: (dispatch) => ({
        get: async (payload: HistoryGetEffect, state) => {
            try {
               /* if (state.history.current_id) {
                    dispatch.history.clear({peer_id: state.history.current_id})
                } */

                const historyResponse: GetHistoryResult = await global.api.getHistory(payload.peer_id, payload.offset, payload.count)

                if (historyResponse.kind !== 'ok') return

                const data = historyResponse.data

                console.log('offset', payload.offset)

                dispatch.history.push({peer_id: payload.peer_id, history: {...data, items: [
                            ...(payload.offset > 0 ? [...state.history.items[payload.peer_id].items, ...data.items] : data.items)
                        ]}})
            } catch (e) {
                console.error(e)
            }
        },
        loadMore: async (payload: {count?: number}, state) => {
            if (!state.history.current_id || !state.history.items[state.history.current_id]) return

            const offset = state.history.items[state.history.current_id].items.length

            await dispatch.history.get({offset, peer_id: state.history.current_id} as HistoryGetEffect)
        }
    })

})


export {history}
