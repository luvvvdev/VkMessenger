import {
    KeyboardAvoidingView,
    TextInput,
    View,
    StyleSheet
} from "react-native";
import React, {useState} from "react";
import Messages from '../../../features/MessagesList'
import {MessagesMessage} from "../../../types/vk";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootModel, RootState} from "../../../models";
// const Messages = React.lazy(() => import('../../../features/MessagesList'))

const getNewMessageId = (lastMessageId) => {
    if (!lastMessageId || lastMessageId < 0) {
        return 0
    }

    return lastMessageId + 1
}

const ConversationScreen = (props) => {
    const peerId = props.route.params.conversation.peer.id

    const dispatch = useDispatch<Dispatch>()

    const lastMessageId = useSelector<RootState, number | null>((state) => {
        const history = state.history.items[peerId]

        if (!history) return null

        const messages = history.items

        return messages[messages.length - 1].id
    })

    const myId = useSelector<RootState>((state) => state.user.user_data?.id)
    const [textMessage, setTextMessage] = useState<string>('')

    const onMessageSend = () => {
        dispatch.history.sendMessage({
            message:
                {
                    id: getNewMessageId(lastMessageId),
                    peer_id: peerId,
                    from_id: myId,
                    text: textMessage,
                    date: Date.now() / 1000,
                    attachments: []} as MessagesMessage
        })
    }

    return <KeyboardAvoidingView behavior={'position'} keyboardVerticalOffset={95}>
            <Messages peer_id={peerId} />
            <View style={styles.messageInputContainer}>
                <TextInput style={styles.messageInput} onSubmitEditing={onMessageSend} onChangeText={(text) => setTextMessage(text)}  placeholder={'Сообщение'}/>
            </View>
    </KeyboardAvoidingView>
}

const styles = StyleSheet.create({
    messageInputContainer: {
        height: 40,
        //marginTop: 5,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 20,
        paddingLeft: 20
    },
    messageInput: {
        width: '100%',
        padding: 10,
        backgroundColor: 'whitesmoke'}
})

export default ConversationScreen
