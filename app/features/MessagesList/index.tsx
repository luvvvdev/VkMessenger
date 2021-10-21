import {ActivityIndicator, FlatList, ListRenderItemInfo, View} from "react-native";
import React from "react";
import {MessagesMessage} from "../../types/vk";
import {MessageItem} from "../../components/MessageItem";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../models";
import {HistoryState} from "../../models/history";

type MessagesProps = {
    peer_id: number
}

export default ({peer_id}: MessagesProps) => {
    const dispatch = useDispatch<Dispatch>()

    const myId = useSelector((state: RootState) => state.user.user_data?.id)
    const history = useSelector<RootState, HistoryState>((state) => state.history)
    const {profiles, groups} = useSelector((state: RootState) => ({profiles: state.conversations.profiles, groups: state.conversations.groups}))

    const renderItem = (data: ListRenderItemInfo<MessagesMessage>) => {
        return <MessageItem message={data.item} myId={myId || 0} extraData={{profiles: profiles || [], groups: groups || []}} style={{marginBottom: 10}}/>
    }

    const keyExtractor = (item: MessagesMessage) => (`message-${item.id}`)

    const onEndReached = ({distanceFromEnd}) => {
        if (distanceFromEnd < 0) return

        console.log('loading more messages', distanceFromEnd)

        dispatch.history.loadMore({count: 200})
            .catch((e) => {
                console.log('loading more error', e)
            })
    }

    let messages: MessagesMessage[] = []

    if (history.items[peer_id]) {
        messages = history.items[peer_id].items
    }

    return (<View>
        {messages.length !== 0 ? (
            <FlatList
                data={messages}
                extraData={[groups, profiles, messages]}
                inverted={true} persistentScrollbar={true}
                initialNumToRender={200}
                maxToRenderPerBatch={50}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                //getItem={(data, index) => data[index]}
                //contentInset={{top: 20, bottom: 20}}
                contentInsetAdjustmentBehavior={'never'}
                automaticallyAdjustContentInsets={false}
                style={{height: '92%', width: '100%'}}
            />
        ) : (
            <View style={{height: '92%', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>

            </View>
        )}
    </View>)
}
