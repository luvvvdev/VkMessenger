import {ConversationItem} from "../../components/ConversationItem/ConversationItem";
import {ActivityIndicator, FlatList, SafeAreaView, Text, View} from "react-native";
import React, {useEffect, useLayoutEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../models";
import {ConversationsState} from "../../models/conversations";
import FastImage from "react-native-fast-image";
import BigList, {BigListRenderItemInfo} from "react-native-big-list";
import {MessagesConversationWithMessage} from "../../types/vk";
import _ from 'lodash'

const ConversationsList = () => {
    const dispatch = useDispatch<Dispatch>()

    const {profiles, groups} = useSelector<RootState, ConversationsState>((state) => state.conversations)
    const conversations = useSelector<RootState, MessagesConversationWithMessage[]>((state) => state.conversations.items)
    const loading = useSelector<RootState, boolean>((state) => state.loading.effects.conversations.get.loading!)

    const getConversations = () => dispatch.conversations.get().then(() => {

        if (profiles && groups) {
            const profilesPhotos = _.compact(profiles?.map((profile) => ({uri: profile.photo_100})))
            const groupsPhotos = _.compact(groups?.map((group) => ({uri: group.photo_100})))

            FastImage.preload([...profilesPhotos, ...groupsPhotos])
        }
    })

    useEffect(() => {
        if (conversations.length === 0) {
            getConversations()
        }
    }, [])

    const renderItem = (data: BigListRenderItemInfo<MessagesConversationWithMessage>) => {
        const item = data.item

        if (!item.conversation) {
            console.log('error VALUE', item.conversation)
            // dispatch.conversations.removeConversation({peer_id: value.last_message.peer_id})
            return null
        }

        return <ConversationItem data={item} key={`conversation-${item.conversation.peer.id}-index`}/>
    }

    return (
        <SafeAreaView>
            <View style={{width: '100%', height: '100%'}}>
                {!loading ?
                    <BigList
                        // key={`${conversations}`}
                        showsHorizontalScrollIndicator={false}
                        itemHeight={65}
                        removeClippedSubviews={true}
                        data={conversations}
                        renderItem={renderItem}
                        // extraData={[conversations]}
                        // renderEmpty={() => <Text>Empty</Text>}
                    /> :
                        (<View>
                            <ActivityIndicator />
                        </View>)
                }
            </View>
        </SafeAreaView>
    )
}

export default ConversationsList
