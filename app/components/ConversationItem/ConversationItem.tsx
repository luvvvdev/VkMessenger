
import {
    Image,
    ImageSourcePropType,
    ImageStyle,
    StyleProp,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";
import React from "react";
import {format, formatDistanceToNowStrict, isSameYear} from 'date-fns'
import {GroupsGroupFull, MessagesConversationWithMessage, UsersUserFull} from "../../types/vk";
import {useSelector} from "react-redux";
import {RootState} from "../../models";
import {isToday} from "date-fns";
import {navigate} from "../../navigators";

type ConversationItemProps = {
    data: MessagesConversationWithMessage
}

type ProfilesAndGroups = {
    profiles: UsersUserFull[]
    groups: GroupsGroupFull[]
}

const ConversationItem = ({data}: ConversationItemProps) => {
    const {profiles, groups} = useSelector<RootState, ProfilesAndGroups>(({conversations}) => ({profiles: conversations.profiles || [], groups: conversations.groups || []}))
    const {conversation, last_message} = data

    const styles: Record<string, StyleProp<ViewStyle | TextStyle | ImageStyle>> = {
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

        }
    }

    const getPhotoUrl = () => {
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

    const getConversationName = () => {
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

    const imgSource: ImageSourcePropType = {
        method: 'GET',
        uri: getPhotoUrl()
    }

    const getLastMessageText = () => {
        if (last_message.text) return last_message.text

        const {attachments} = last_message

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

    const getDate = () => {
        const messageDate = last_message.date * 1000

        if (isToday(messageDate)) return formatDistanceToNowStrict(messageDate)
        if (isSameYear(messageDate, new Date())) return format(messageDate, 'd MMM')

        return format(messageDate, 'dd.MM.yyyy')
    }

    return (
        <TouchableOpacity onPress={() => navigate('conversation', {conversation: conversation, photo: getPhotoUrl(), title: getConversationName()})}>
            <View style={styles.container}>
                <View style={styles.leadingPart}>
                    <Image style={styles.image as ImageStyle} source={imgSource} />
                    <View>
                        <Text style={styles.userName}>{`${getConversationName()}`}</Text>
                        <View style={{width: 260, display: "flex", flexDirection: 'row'}}>
                            <Text style={styles.textMessage} numberOfLines={1}>{`${getLastMessageText()}`}</Text>
                            <Text style={{color: 'gray'}}>{' '}· {getDate()}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export {ConversationItem, ConversationItemProps}
