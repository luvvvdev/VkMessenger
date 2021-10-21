import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView, ListRenderItemInfo, StatusBar,
    TextInput,
    View
} from "react-native";
import React, {useLayoutEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../models";
import {HistoryState} from "../../models/history";
import {MessageItem} from "../../components/MessageItem";
import {MessagesMessage} from "../../types/vk";
import {Message} from "../../entities/Message";
import {navigate} from "../../navigators";
import {useErrorHandler} from 'react-error-boundary'
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";

const Messages = React.lazy(() => import(/* webpackChunkName: "Messages" */ '../../features/Messages'))

const ConversationScreen = (props) => {
    const dispatch = useDispatch<Dispatch>()

    const handleError = useErrorHandler()
    const insets = useSafeAreaInsets()

    const [textMessage, setTextMessage] = useState<string>('')

    const peerId = props.route.params.conversation.peer.id

    useLayoutEffect(() => {
        dispatch.history.get({peer_id: peerId, offset: 0, count: 200})
            .catch((error) => {
                handleError(error)
                console.log('error')
                dispatch.history.clear({peer_id: peerId})
                navigate('messenger')

            })

        /* dispatch.history.get({peer_id: peerId, offset: 0, count: 200})
            .catch((error) => {
                dispatch.history.clear({peer_id: peerId})
            })*/

        return () => {
            // for minimizing cached messages for current conversation
            // dispatch.history.clearLoaded({peer_id: peerId})
            dispatch.history.setCurrentId({peer_id: null})
        }
    }, [])



    const onMessageSend = () => {
        // dispatch.history.sendMessage({message: new Message({id: messages[0].id + 1, peer_id: peerId, from_id: myId, text: textMessage, date: Date.now() / 1000, attachments: []} as MessagesMessage)})
    }

    return <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={100}>
        <View style={{ paddingRight: 20, paddingLeft: 20, paddingBottom: insets.bottom, backgroundColor: 'white', display: 'flex', flexDirection: 'column'}}>
            <Messages peer_id={peerId} />
            <View style={{height: '8%', marginTop: 5, width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                <TextInput style={{width: '100%', padding: 10, backgroundColor: 'whitesmoke'}} onSubmitEditing={onMessageSend} onChangeText={(text) => setTextMessage(text)}  placeholder={'Сообщение'}/>
            </View>
        </View>
    </KeyboardAvoidingView>
}

export default ConversationScreen
