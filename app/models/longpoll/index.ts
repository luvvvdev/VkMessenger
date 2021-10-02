import {createModel} from "@rematch/core";
import {RootModel} from "../index";
import {getPeerType} from "../../utils/peerType";
import {
    GroupsGroupFull,
    MessagesConversation,
    MessagesConversationWithMessage, MessagesGetHistoryResponse,
    MessagesMessage,
    UsersUserFull
} from "../../types/vk";
import {getMessageByEvent} from "./utils/messageFromEvent";

type LongPollState = {
    server: string | null
    key: string | null
    failed?: number | null
    ts: number | null
    updates: any[]
}

enum LongPollEvents {
    REPLACE_MESSAGE_FLAGS = 1,
    SET_MESSAGE_FLAGS,
    RESET_MESSAGE_FLAGS,
    ADD_MESSAGE,
    EDIT_MESSAGE,
    USER_BECAME_ONLINE = 8,
    USER_BECAME_OFFLINE,
    EDIT_CONVERSATION_PARAM = 51,
    EDIT_CHAT_INFO ,
    USER_WRITE_DIALOG = 61,
    USER_WRITE_CONVERSATION,
    USERS_WRITE_CONVERSATION,
    USERS_RECORD_VOICE

}

const longpoll = createModel<RootModel>()({
    state: {
        server: null,
        key: null,
        ts: null,
        updates: [],
        failed: null,
    } as LongPollState,
    reducers: {
        update: (state, payload?: LongPollState) => (!payload ? state : payload)
    },
    effects: (dispatch) => ({
        connect: async (payload, state) => {
            console.log(state.longpoll)
            //state.longpoll.server &&
            //if ( !state.longpoll.failed) return

            console.log(`[longpoll] ${state.longpoll.failed ? 're' : ''}connecting to longpoll server..`)
            const response = await global.api.getLongPollServer()

            if (response.kind !== 'ok') return

            console.log('[longpoll] successful connected!', response.data)

            dispatch.longpoll.update({...state.longpoll, ...response.data})
        },
        getUpdates: async (payload, state) => {
            console.log('[longpoll] getting updates..')
            const {server, key, ts} = state.longpoll

            const response = await global.api.getLongPollUpdates(server, key, ts)

            if (response.kind !== "ok" || response.data?.failed) {
                switch (response.data?.failed) {
                    case 2 || 3:
                        dispatch.longpoll.connect()
                        return
                    case 4:
                        throw new Error('Invalid LongPoll version number')
                }

                return
            }

            console.log('[longpoll] updates: ', response)
            dispatch.longpoll.update({...state.longpoll, ...response.data})
        },
        handleUpdates: async (payload, state) => {
            const currentUserId = state.user.user_data!.id
            const sendMessagesEvents = state.longpoll.updates.filter((event: any[]) => (event[0] === LongPollEvents.ADD_MESSAGE)).map((event) => getMessageByEvent(event, currentUserId))

            const sortedByPeerIdDictOfEvents: {[key: number]: MessagesMessage[]} = {}

            sendMessagesEvents.forEach((message) => sortedByPeerIdDictOfEvents[message.peer_id].push(message))

            const handleMessages = async () => {
                Object.keys(sortedByPeerIdDictOfEvents).forEach((peer_id) => {
                    const messages: MessagesMessage[] = sortedByPeerIdDictOfEvents[peer_id]

                    const conversations = state.conversations.items
                    const conversationIndex = conversations.findIndex((conversation) => conversation.conversation.peer.id === Number(peer_id))
                    let conversation = conversations[conversationIndex]

                    if (conversation) {
                        const conversationToUpdateLastMessage = conversation
                        conversationToUpdateLastMessage.last_message = messages[messages.length]

                        conversations[conversationIndex] = conversationToUpdateLastMessage

                        dispatch.conversations.update({...state.conversations, items: conversations})

                        const historyToUpdate = state.history.items[Number(peer_id)]

                        historyToUpdate.items.reverse().push(...messages)
                        historyToUpdate.items.reverse()

                        dispatch.history.update({peer_id: Number(peer_id), history: historyToUpdate})
                        return
                    }

                    const conversationRes = await global.api.getConversationsById([Number(peer_id)])
                    const newConversation: MessagesConversation = conversationRes.data.items[0]

                    if (conversationRes.kind !== 'ok') return

                    conversation = {
                        conversation: newConversation,
                        last_message: messages[messages.length]
                    }

                    if (!state.conversations.groups || !state.conversations.profiles) return

                    const groups: GroupsGroupFull[] = [...state.conversations.groups]
                    const profiles: UsersUserFull[] = [...state.conversations.profiles]

                    if (newConversation.peer.type === 'group') {
                        const group = conversationRes.data.groups?.find((group: GroupsGroupFull) => group.id === 0 - Number(peer_id))

                        groups.push(group)
                    } else if (newConversation.peer.type === 'user') {
                        //console.log('pushing new profile', conversationRes.data.profiles?.find((profile: UsersUserFull) => profile.id === peerId))
                        profiles.push(conversationRes.data.profiles?.find((profile: UsersUserFull) => profile.id === Number(peer_id)))
                    }

                    dispatch.conversations.update({...state.conversations, profiles, groups, items: [...state.conversations.items, conversation]})
                })
            }

            const getNotSavedConversations: Promise<void>[] = sendMessagesEvents.map(async (event) => {
                const peerId = event[4]
                const prevMessage = state.longpoll.updates.find((_event) => _event[1] === event[1])

                //if (prevMessage) return

                const conversations = state.conversations.items
                const conversationIndex = conversations.findIndex((conversation) => conversation.conversation.peer.id === peerId)
                let conversation = conversations[conversationIndex]

                const newMessage = getMessageByEvent(event, currentUserId)

                console.log('newMessage', newMessage)

                if (conversation) {
                    const conversationToUpdateLastMessage = conversation
                    conversationToUpdateLastMessage.last_message = newMessage

                    conversations[conversationIndex] = conversationToUpdateLastMessage

                    dispatch.conversations.update({...state.conversations, items: conversations})

                    const historyToUpdate = state.history.items[peerId]

                    historyToUpdate.items.reverse().push(newMessage)
                    historyToUpdate.items.reverse()

                    dispatch.history.update({peer_id: peerId, history: historyToUpdate})
                    return
                }

                const conversationRes = await global.api.getConversationsById([peerId])
                const newConversation: MessagesConversation = conversationRes.data.items[0]

                if (conversationRes.kind !== 'ok') return

                conversation = {
                    conversation: newConversation,
                    last_message: newMessage
                }

                if (!state.conversations.groups || !state.conversations.profiles) return

                const groups: GroupsGroupFull[] = [...state.conversations.groups]
                const profiles: UsersUserFull[] = [...state.conversations.profiles]

                if (newConversation.peer.type === 'group') {
                    const group = conversationRes.data.groups?.find((group: GroupsGroupFull) => group.id === 0 - peerId)

                    groups.push(group)
                } else if (newConversation.peer.type === 'user') {
                    //console.log('pushing new profile', conversationRes.data.profiles?.find((profile: UsersUserFull) => profile.id === peerId))
                    profiles.push(conversationRes.data.profiles?.find((profile: UsersUserFull) => profile.id === peerId))
                }

                dispatch.conversations.update({...state.conversations, profiles, groups, items: [...state.conversations.items, conversation]})
            })

            await Promise.all(getNotSavedConversations)
        },
        lookup: async (payload, state) => {
            console.log('[longpool] looking up for update')

            try {
                await dispatch.longpoll.update({...state.longpoll, updates: []})

                await dispatch.longpoll.getUpdates().then(async () => {
                    await dispatch.longpoll.handleUpdates()
                })

                await dispatch.longpoll.lookup()
                return
            } catch (e) {
                console.log('lookup error', e)
                return
            }
        }
    })
})

export {longpoll}
