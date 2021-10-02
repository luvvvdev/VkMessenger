import {
    FlatList,
    KeyboardAvoidingView, ListRenderItemInfo,
    SafeAreaView,
    TextInput,
    View
} from "react-native";
import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../models";
import {HistoryState} from "../../models/history";
import {Message} from "../../components/Message";
import {MessagesMessage} from "../../types/vk";

const ConversationScreen = (props) => {
    const dispatch = useDispatch<Dispatch>()
    const myId = useSelector((state: RootState) => state.user.user_data?.id)
    const history = useSelector<RootState, HistoryState>((state) => state.history)
    const {profiles, groups} = useSelector((state: RootState) => ({profiles: state.conversations.profiles, groups: state.conversations.groups}))
    //const user = useSelector<RootState, UsersUserFull>((state) => state.user.user_data!)
    //const messagesListRef = useRef<FlatList>(null)

    const peerId = props.route.params.conversation.peer.id

    useEffect(() => {
        dispatch.history.get({peer_id: peerId, offset: 0, count: 200})

        return () => {
            // for minimizing cached messages for current conversation
            dispatch.history.clearLoaded({peer_id: peerId})
        }
    }, [])

    const renderItem = (data: ListRenderItemInfo<MessagesMessage>) => {
        return <Message message={data.item} myId={myId || 0} extraData={{profiles: profiles || [], groups: groups || []}} style={{marginBottom: 10}}/>
    }

    const keyExtractor = (item: MessagesMessage) => (`message${item.id}`)

    const onEndReached = async ({distanceFromEnd}) => {
        if (distanceFromEnd < 0) return

        console.log('loading more messages', distanceFromEnd)

        try {
            await dispatch.history.loadMore({count: 150})
        } catch (e) {
            console.error('Messages load more error', e)
        }
    }

    const messages: MessagesMessage[] = history.items[peerId]?.items || []

    return <SafeAreaView>

        <View style={{paddingRight: 20, paddingLeft: 20, paddingTop: 15, display: 'flex', flexDirection: 'column'}}>
            <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={100}>
                <FlatList data={messages} extraData={{profiles, groups}} inverted={true} persistentScrollbar={true} initialNumToRender={20} maxToRenderPerBatch={100} onEndReachedThreshold={0.3} onEndReached={onEndReached} renderItem={renderItem} keyExtractor={keyExtractor} style={{height: '92%', width: '100%'}}/>
                <View style={{height: '8%', marginTop: 5, width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                    <TextInput style={{width: '100%', padding: 10, backgroundColor: 'whitesmoke'}} placeholder={'Сообщение'}/>
                </View>
            </KeyboardAvoidingView>
        </View>

    </SafeAreaView>
}

export default ConversationScreen
