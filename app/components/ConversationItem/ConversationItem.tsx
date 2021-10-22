import {
    ImageStyle,
    StyleProp, StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";
import React, {memo} from "react";
import {differenceInMinutes, format, formatDistanceToNowStrict, isSameYear, isToday} from 'date-fns'
import {GroupsGroupFull, MessagesConversationWithMessage, UsersUserFull} from "../../types/vk";
import {useSelector} from "react-redux";
import {RootState} from "../../models";
import FastImage from "react-native-fast-image";

type ConversationItemProps = {
    data: MessagesConversationWithMessage
}

type ProfilesAndGroups = {
    profiles: UsersUserFull[]
    groups: GroupsGroupFull[]
}

const getDate = (last_message) => {
    const messageDate = last_message.date * 1000

    if (differenceInMinutes(Date.now(), messageDate) <= 1) return 'Сейчас'
    if (isToday(messageDate)) return formatDistanceToNowStrict(messageDate)
    if (isSameYear(messageDate, new Date())) return format(messageDate, 'd MMM')

    return format(messageDate, 'dd.MM.yyyy')
}

const getLastMessageText = (last_message) => {
    //console.log('message text', last_message)
    if (last_message.text) return last_message.text

    const {attachments} = last_message

    if (!attachments) return 'None'

    const first_attachment = attachments![0]

    if (!first_attachment) return 'Вложение'

    if (first_attachment?.type === 'photo') return 'Фотография'
    if (first_attachment?.type === 'sticker') return 'Стикер'
    if (first_attachment?.type === 'audio_message') return 'Голосовое сообщение'
    if (first_attachment?.type === 'audio') return 'Аудиозапись'
    if (first_attachment?.type === 'video') return 'Видео'
    if (first_attachment?.type === 'link') return 'Ссылка'
    if (first_attachment?.type === 'wall') return 'Запись'
    if (first_attachment?.type === 'poll') return 'Опрос'

    return 'Вложение'
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
                            <Text style={{color: 'gray'}}>{' '}· {getDate(last_message)}</Text>
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
