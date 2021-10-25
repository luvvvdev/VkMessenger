import {
    ImageStyle, PlatformColor,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, {memo} from "react";
import {MessagesConversationWithMessage} from "../../types/vk";
import FastImage from "react-native-fast-image";
import {TimeAgo} from "./TimeAgo";
import {translate, TxKeyPath} from "../../i18n";
import _ from "lodash";
import {getPeerById} from "../../utils/getPeerById";
import {Avatar} from "../Avatar/Avatar";

type ConversationItemProps = {
    data: MessagesConversationWithMessage
}

const getLastMessageText = (last_message) => {
    if (last_message.text) return last_message.text

    const {attachments} = last_message

    if (!attachments) return ''

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

const getConversationName = (conversation, peer) => {
    switch (conversation.peer.type) {
        case 'user':
            return `${peer?.first_name} ${peer?.last_name}`
        case 'group':
            return `${peer?.name}`
        default:
            return conversation.chat_settings?.title
    }
}

const getPhotoUrl = (conversation, peer) => {
    switch (conversation.peer.type) {
        case 'user' || 'group':
            return peer?.photo_100
        default:
            return conversation.chat_settings?.photo?.photo_100 || conversation.chat_settings?.photo?.photo_50
    }
}

const ConversationItem = memo(({data, ...rest}: ConversationItemProps) => {
    const {conversation, last_message} = data
    const peer = getPeerById(conversation.peer.id)

    const conversationPhotoUrl = getPhotoUrl(conversation, peer)
    const conversationName = getConversationName(conversation, peer)

    return (
        <TouchableOpacity onPress={() => onOpen(conversation, conversationPhotoUrl, conversationName)}>
            <View style={styles.container}>
                <View style={styles.leadingPart}>
                    <Avatar url={conversationPhotoUrl} size={55} style={{marginRight: 10}}/>
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
},
    ((prevProps,
      nextProps) => _.isEqual(prevProps.data.conversation, nextProps.data.conversation)))

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingRight: 15,
        paddingLeft: 15,
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
        marginBottom: 4,
        color: PlatformColor('label')
    },
    textMessage: {
        maxWidth: 200,
        maxHeight: '100%',
        color: PlatformColor('secondaryLabel'),
    },
    trailingPart: {

    },
    lastMessageContainer: {
        width: 260,
        display: "flex",
        flexDirection: 'row'
    }
})

export {ConversationItem, ConversationItemProps}
