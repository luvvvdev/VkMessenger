import {ConversationItem} from "../../components/ConversationItem/ConversationItem";
import {ActivityIndicator, FlatList, View} from "react-native";
import React, {useEffect, useLayoutEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../models";
import {ConversationsState} from "../../models/conversations";
import FastImage from "react-native-fast-image";

const ConversationsList = () => {
    const dispatch = useDispatch<Dispatch>()

    const conversations = useSelector<RootState, ConversationsState>((state) => state.conversations)
    const loading = useSelector<RootState, boolean>((state) => state.loading.effects.conversations.get.loading!)

    const getConversations = () => dispatch.conversations.get().then(() => {

        if (conversations.profiles && conversations.groups) {
            const profilesPhotos = conversations.profiles?.map((profile) => ({uri: profile.photo_100})).filter((src) => typeof src.uri !== 'undefined')
            const groupsPhotos = conversations.groups?.map((group) => ({uri: group.photo_100})).filter((src) => typeof src.uri !== 'undefined')

            FastImage.preload([...profilesPhotos, ...groupsPhotos])
        }
    })

    useEffect(() => {
        getConversations()
    }, [])

    const renderItem = ({index, item}) => {

        if (!item.conversation) {
            console.log('error VALUE', item.conversation)

            // dispatch.conversations.removeConversation({peer_id: value.last_message.peer_id})
            return null
        }

        return <ConversationItem data={item} key={`conversation-${item.conversation.peer.id}-index`}/>
    }

    return (
        <View style={{width: '100%'}}>
            {
               !loading ? (
                    <FlatList showsHorizontalScrollIndicator={false} extraData={[conversations]} data={conversations.items} renderItem={renderItem} />
                ) : (
                   <View>
                       <ActivityIndicator />
                   </View>
               )
            }

        </View>
    )
}

export default ConversationsList
