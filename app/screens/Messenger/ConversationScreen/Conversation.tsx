import {
    KeyboardAvoidingView,
    TextInput,
    View,
    StyleSheet
} from "react-native";
import React, {useState} from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Lazy} from "../../../components/Lazy/Lazy";

const Messages = React.lazy(() => import('../../../features/MessagesList'))

const ConversationScreen = (props) => {
    const [textMessage, setTextMessage] = useState<string>('')

    const peerId = props.route.params.conversation.peer.id

    const onMessageSend = () => {
        // dispatch.history.sendMessage({message: new Message({id: messages[0].id + 1, peer_id: peerId, from_id: myId, text: textMessage, date: Date.now() / 1000, attachments: []} as MessagesMessage)})
    }

    return <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={100}>
            <Lazy>
                <Messages peer_id={peerId} />
            </Lazy>
            <View style={styles.messageInputContainer}>
                <TextInput style={styles.messageInput} onSubmitEditing={onMessageSend} onChangeText={(text) => setTextMessage(text)}  placeholder={'Сообщение'}/>
            </View>
    </KeyboardAvoidingView>
}

const styles = StyleSheet.create({
    messageInputContainer: {
        //height: 30,
        //marginTop: 5,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row'
    },
    messageInput: {
        width: '100%',
        padding: 10,
        backgroundColor: 'whitesmoke'}
})

export default ConversationScreen
