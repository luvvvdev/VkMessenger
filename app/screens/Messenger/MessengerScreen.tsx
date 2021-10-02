import React, {useEffect} from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
} from "react-native";
import {Dispatch, RootState} from "../../models";
import {useDispatch, useSelector} from "react-redux";
import {ConversationsState} from "../../models/conversations";
import {ConversationItem} from "../../components/ConversationItem/ConversationItem";
import {TextField} from "../../components/TextField/TextField";
import FastImage from "react-native-fast-image";

export const MessengerScreen = () => {
    const dispatch = useDispatch<Dispatch>()
    const conversations = useSelector<RootState, ConversationsState>((state) => state.conversations)

    const getConversations = () => {
        if (conversations.profiles && conversations.groups) {
            const profilesPhotos = conversations.profiles?.map((profile) => ({uri: profile.photo_100})).filter((src) => typeof src.uri !== 'undefined')
            const groupsPhotos = conversations.groups?.map((group) => ({uri: group.photo_100})).filter((src) => typeof src.uri !== 'undefined')

            FastImage.preload([...profilesPhotos, ...groupsPhotos])
        }
        dispatch.conversations.get().then(() => {
            //setTimeout(() => getConversations(), 5000)
        })
    }

    const subscribeUpdates = async () => {
        await dispatch.longpoll.connect()
        await dispatch.longpoll.lookup()
    }

    //dispatch.conversations.clear()

    useEffect(() => {
        subscribeUpdates()

        getConversations()
    }, [])

    const conversationsSortedByDate = conversations

    return (
        <SafeAreaView>
            <View style={{paddingRight: 20, paddingLeft: 20}}>
                <TextField style={{marginBottom: 20, marginTop: 5}} variant={'primary'} placeholder={'Поиск'}/>
                <ScrollView showsHorizontalScrollIndicator={false}>
                    {
                        conversations && (
                            conversations.items.map((value) => {
                                return <ConversationItem data={value} key={value.conversation.peer.id}/>
                            })
                        )
                    }
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

//default connect(mapState, mapDispatch)(MessengerScreen)
