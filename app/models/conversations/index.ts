import {createModel} from '@rematch/core'
import {RootModel} from "../index";
import * as Objects from "../../types/vk/objects";
import {ConversationWithMessage} from "../../entities/ConversationWithMessage";
import {Message} from "../../entities/Message";
import {MessagesConversationWithMessage, MessagesMessage} from "../../types/vk/objects";
import _ from 'lodash'

export interface ConversationsState {
    /**
     * Total number
     */
    count: number;
    /**
     * Unread dialogs number
     */
    unread_count?: number;
    [key: string]: any;
    items: MessagesConversationWithMessage[];
    profiles?: Objects.UsersUserFull[];
    groups?: Objects.GroupsGroupFull[];
}

const initialState: ConversationsState = {
    count: 0,
    unread_count: 0,
    items: [],
    profiles: [],
    groups: [],
}

export const conversations = createModel<RootModel>()({
    state: initialState as ConversationsState,
    reducers: {
        reset: () => (initialState),
        update: (state, payload: ConversationsState) => (payload ? payload : state),
        clear: () => (initialState),
        removeConversation: (state, {peer_id}) => {
            const indexOfConversation = state.items.findIndex((v) => v.conversation.peer.id === peer_id)
            delete state.items[indexOfConversation]

            return {...state, items: state.items}
        },
    },
    effects: dispatch => ({
        get: async (payload, state) => {
            try {
                // console.log(global.api)
                const response = await global.api.getConversations()

                if (response.kind !== 'ok' || !response.data.response) {
                    throw new Error('Cant get Conversations')
                }

                const items = response.data.response.items

                // console.log(items)

                dispatch.conversations.update({...response.data.response, items})

                //dispatch.conversations.setLoading(false)
                return
            }
            catch (e) {
                console.error('Get conversation error')
                return
            }

            return
        },
        editLastMessage: async ({message, retries = 0}: {message: MessagesMessage, retries?: number}, state) => {
            try {
                console.log('updating last message')

                const currentConversationPredicate = (value: MessagesConversationWithMessage) => value.last_message.peer_id === message.peer_id
                let currentConversationIndex = _.findIndex(state.conversations.items, currentConversationPredicate)
                let currentConversation = state.conversations.items[currentConversationIndex] as MessagesConversationWithMessage

                if (!currentConversation) {
                    console.log('nothing try to get data..')
                    const newData = await global.api.getConversationsById([message.peer_id])

                    if (newData.kind !== 'ok' || !newData.data.response) return

                    if (newData.data.response.count > 1) return

                    currentConversation = {last_message: message, conversation: newData.data.response.items[0]}

                    dispatch.conversations.update({...state.conversations, items: [...state.conversations.items, currentConversation], profiles: [...state.conversations.profiles!, ...newData.data.response.profiles[0]], groups: [...state.conversations.groups!, ...newData.data.response.groups[0]]})
                } else {
                    console.log('update last message');
                    (currentConversation as MessagesConversationWithMessage).last_message = message as MessagesMessage

                    let newItems = state.conversations.items

                    // state.conversations.items = state.conversations.items.filter((v) => !!v)
                    // {conversation: currentConversation.conversation, last_message: message},
                    // console.log(newItems[currentConversationIndex])

                    // delete newItems[currentConversationIndex]
                    currentConversation.last_message = {...message, date: new Date().getTime()}
                    // newItems = [currentConversation, ..._.compact(newItems)]

                    delete newItems[currentConversationIndex]

                    newItems = [{conversation: currentConversation.conversation, last_message: message},
                        ..._.compact(newItems)]

                    console.log('new', newItems[currentConversationIndex])

                    dispatch.conversations.update({
                    ...state.conversations,
                    items: newItems
                    }) //[currentConversation, ...state.conversations.items]
                }
            } catch (error) {
                console.error('editLastMessage error', message.id)
            }
        },
        find: async () => {
            return
        }
    })
})
