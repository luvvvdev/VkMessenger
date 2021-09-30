import React, {useEffect} from "react";
import {
    SafeAreaView,
    ScrollView, TouchableOpacity,
    View,
} from "react-native";
import {Dispatch, RootState} from "../../models";
import {useDispatch, useSelector} from "react-redux";
import {ConversationsState} from "../../models/conversations";
import {ConversationItem} from "../../components/ConversationItem/ConversationItem";
import {TextField} from "../../components/TextField/TextField";
import {navigate} from "../../navigators";

export const MessengerScreen = () => {
    const dispatch = useDispatch<Dispatch>()
    const conversations = useSelector<RootState, ConversationsState>((state) => state.conversations)

    const getConversations = () => {
        dispatch.conversations.get().then((data) => {
            setTimeout(() => getConversations(), 5000)
            return data
        })
    }

    useEffect(() => {
        getConversations()
    }, [])

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
