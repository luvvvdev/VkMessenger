import {createModel} from "@rematch/core";
import {RootModel} from "../index";

type LongPollState = {
    server: string | null
    key: string | null
    failed?: number | null
    ts: number | null
    updates: Array<any>[]
    active: boolean
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

const initialState: LongPollState = {
    server: null,
    key: null,
    ts: null,
    updates: [],
    failed: null,
    active: false
};

/*handleUpdates: async (payload, state) => {
            const currentUserId = state.user.user_data!.id
            const sendMessagesEvents = state.longpoll.updates.filter((event: any[]) => (event[0] === LongPollEvents.ADD_MESSAGE)).map((event) => getMessageByEvent(event, currentUserId))

            const sortedByPeerIdDictOfEvents: {[key: number]: MessagesMessage[]} = {}

            console.log('sorted', sortedByPeerIdDictOfEvents)

            sendMessagesEvents.forEach((message) => {
                sortedByPeerIdDictOfEvents[message.peer_id] = []
                sortedByPeerIdDictOfEvents[message.peer_id].push(message)

                console.log(sortedByPeerIdDictOfEvents)

            })

            const handleMessages = async () => {
                const updatePromises = Object.keys(sortedByPeerIdDictOfEvents).map(async (peer_id) => {
                    const messages: MessagesMessage[] = sortedByPeerIdDictOfEvents[peer_id]

                    let conversations = Array.from(state.conversations.items).reverse()
                    const conversationIndex = conversations.findIndex((conversation) => conversation.conversation.peer.id === Number(peer_id))
                    let conversation = conversations[conversationIndex]

                    if (conversation) {
                        const conversationToUpdateLastMessage = conversation
                        conversationToUpdateLastMessage.last_message = new Message(messages[messages.length - 1])

                        conversations.push(conversationToUpdateLastMessage)

                        delete conversations[conversationIndex]

                        conversations = conversations.filter((c) => c)
                        conversations = conversations.reverse()

                        console.log('last message!!', conversationToUpdateLastMessage)

                        if (conversationToUpdateLastMessage) {
                            dispatch.conversations.update({...state.conversations, items: conversations})
                        }

                        const historyToUpdate = state.history.items[peer_id]

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

                await Promise.all(updatePromises)
            }

            await handleMessages()

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
},*/

const longpoll = createModel<RootModel>()({
    state: initialState,
    reducers: {
        reset: () => (initialState),
        update: (state, payload?: LongPollState) => (!payload ? state : payload)
    },
    effects: (dispatch) => ({
        connect: async (payload, state) => {
            // console.log(state.longpoll)

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

            if (!server) return

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
        stop: (payload, state) => {
            dispatch.longpoll.update({...state.longpoll, updates: [], active: true})
        },
        start: (payload, state) => {
            dispatch.longpoll.update({...state.longpoll, updates: [], active: true})
        },
        lookup: async (payload, state) => {
            if (state.longpoll.active) return
            console.log('[longpool] looking up for update')

            try {
                await dispatch.longpoll.update({...state.longpoll, updates: [], active: true})

                await dispatch.longpoll.getUpdates().then(async () => {
                    // await dispatch.longpoll.handleUpdates()
                })

                return
            } catch (e) {
                await dispatch.longpoll.update({...state.longpoll, updates: [], active: false})
                console.log('lookup error', e)
                return
            }
        }
    })
})

export {longpoll}
