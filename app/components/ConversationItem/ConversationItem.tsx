import {
    ImageStyle,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, {memo} from "react";
import {GroupsGroupFull, MessagesConversationWithMessage, UsersUserFull} from "../../types/vk";
import {useSelector} from "react-redux";
import {RootState} from "../../models";
import FastImage from "react-native-fast-image";
import {TimeAgo} from "./TimeAgo";
import {translate, TxKeyPath} from "../../i18n";

type ConversationItemProps = {
    data: MessagesConversationWithMessage
}

type ProfilesAndGroups = {
    profiles: UsersUserFull[]
    groups: GroupsGroupFull[]
}

const getLastMessageText = (last_message) => {
    //console.log('message text', last_message)
    if (last_message.text) return last_message.text

    const {attachments} = last_message

    if (!attachments) return 'None'

    if (attachments.length > 1) {
        return `${attachments.length} ${translate(`common.attachments_types.many`)}`
    }

    const first_attachment = attachments[0]

    return translate(`common.attachments_types.${first_attachment?.type}` as TxKeyPath, {
        defaultValue: "common.attachments_types.default",

    })
}

const onOpen = (conversation, photo, title) => {
    import('../../navigators').then((n) => {
        n.navigate('conversation', {conversation, photo, title})
    })
}

const getConversationName = (conversation, profiles, groups) => {
    switch (conversation.peer.type) {
        case 'user':
            const profile = profiles.find((profile) => profile.id === conversation.peer.id)

            return `${profile?.first_name} ${profile?.last_name}`
        case 'group':
            const group = groups.find(group => group.id === conversation.peer.local_id)
            return `${group?.name}`
        case 'chat':
            return conversation.chat_settings?.title
    }
}

const getPhotoUrl = (conversation, profiles, groups) => {
    switch (conversation.peer.type) {
        case 'user':
            const profile = profiles.find((profile) => profile.id === conversation.peer.id)
            return profile?.photo_100
        case 'group':
            const group = groups.find(group => group.id === conversation.peer.local_id)
            return group?.photo_200
        case 'chat':
            return conversation.chat_settings?.photo?.photo_100 || conversation.chat_settings?.photo?.photo_50
    }
}

const ConversationItem = memo(({data, ...rest}: ConversationItemProps) => {
    const {profiles, groups} = useSelector<RootState, ProfilesAndGroups>(({conversations}) => ({profiles: conversations.profiles || [], groups: conversations.groups || []}))
    const {conversation, last_message} = data

    const conversationPhotoUrl = getPhotoUrl(conversation, profiles, groups)
    const conversationName = getConversationName(conversation, profiles, groups)

    const imgSource = {
        method: 'GET',
        uri: conversationPhotoUrl
    }

    return (
        <TouchableOpacity onPress={() => onOpen(conversation, conversationPhotoUrl, conversationName)}>
            <View style={styles.container}>
                <View style={styles.leadingPart}>
                    <FastImage style={styles.image as any} source={imgSource} />
                    <View>
                        <Text style={styles.userName}>{`${conversationName}`}</Text>
                        <View style={styles.lastMessageContainer}>
                            <Text style={styles.textMessage} numberOfLines={1}>{`${getLastMessageText(last_message)}`}</Text>
                            <TimeAgo last_message={last_message}/>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
})

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    image: {
        height: 55,
        width: 55,
        borderRadius: 50,
        backgroundColor: 'gray',
        marginRight: 10
    } as ImageStyle,
    leadingPart: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        width: 260,
        marginBottom: 4
    },
    textMessage: {
        maxWidth: 200,
        maxHeight: '100%',
        color: 'gray',
    },
    trailingPart: {

    },
    lastMessageContainer: {width: 260, display: "flex", flexDirection: 'row'}
})

export {ConversationItem, ConversationItemProps}
