import React, {useLayoutEffect} from "react";
import {
    ScrollView,
    View,
} from "react-native";
import {Dispatch, RootState} from "../../models";
import {useDispatch, useSelector} from "react-redux";
import {ConversationsState} from "../../models/conversations";
import {ConversationItem} from "../../components/ConversationItem/ConversationItem";
import {TextField} from "../../components/TextField/TextField";
import FastImage from "react-native-fast-image";
import {startLongPoll, stopLongPoll} from "../../services/LongPoll/background";
import BackgroundService from "react-native-background-actions";

export default () => {
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
        if (global.lp_started || BackgroundService.isRunning()) return

        await startLongPoll()

        global.lp.on('lp_server_connect', () => {
            console.log('[LP] server connecting')
        })

        global.lp.on('lp_server_connect_failed', () => {
            console.log('[LP] server failed')
        })

        global.lp.on('lp_server_connect_ok', (data) => {
            console.log('[LP] server ok', data)
        })
        global.lp.on('lp_server_reconnect', (data) => {
            console.log('[LP] server reconnect', data)
        })

        global.lp.on('lp_updates_check_ok', ({ts, updates}) => {
            console.log('[LP] new updates, ', {ts, updates})
        })

        global.lp.on('lp_updates_check', () => {
            console.log('[LP] start checking')
        })

        global.lp.on('lp_updates_check_failed', (data) => {
            console.log('[LP] updates failed', data)
        })
    }

    //dispatch.conversations.clear()

    useLayoutEffect(() => {
        subscribeUpdates()

        getConversations()

        return () => {
            stopLongPoll()
        }
    }, [])

    return (
            <View style={{paddingRight: 20, paddingLeft: 20}}>
                <TextField style={{marginBottom: 20, marginTop: 5}} variant={'primary'} placeholder={'Поиск'}/>
                <ScrollView showsHorizontalScrollIndicator={false}>
                    {
                        conversations && (
                            conversations.items.map((value) => {
                                if (!value.conversation) {
                                    console.log('error VALUE', value.conversation)
                                    // @ts-ignore

                                    // dispatch.conversations.removeConversation({peer_id: value.last_message.peer_id})
                                    return null
                                }

                                return <ConversationItem data={value} key={value.conversation.peer.id}/>
                            })
                        )
                    }
                </ScrollView>
            </View>
    )
}

//default connect(mapState, mapDispatch)(MessengerScreen)
