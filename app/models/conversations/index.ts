import {createModel} from '@rematch/core'
import {MessagesGetConversationsResponse} from "../../types/vk";
import {RootModel} from "../index";

export type ConversationsState = MessagesGetConversationsResponse

export const conversations = createModel<RootModel>()({
    state: {
        count: 0,
        unread_count: 0,
        items: [],
        profiles: [],
        groups: []
    } as ConversationsState,
    reducers: {
        update: (state, payload: ConversationsState) => (payload ? payload : state),
        clean: () => ({
            count: 0,
            unread_count: 0,
            items: [],
            profiles: [],
            groups: []
        })
    },
    effects: dispatch => ({
        get: async () => {
            try {
                const {data} = await global.api.getConversations()

                dispatch.conversations.update(data)
            }
            catch (e) {
                console.error(e)
            }
        },
        find: async () => {
            return
        }
    })
})
