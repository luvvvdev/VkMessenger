import {StyleSheet, Text, View, ViewStyle} from "react-native";
import React, {memo, useEffect, useLayoutEffect, useState} from "react";
import {GroupsGroupFull, MessagesMessage, UsersUserFull} from "../../types/vk";
import {format} from "date-fns";
import FastImage from "react-native-fast-image"

type MessageItemProps = {
    message: MessagesMessage
    style?: ViewStyle
    extraData: {
        profiles: UsersUserFull[]
        groups: GroupsGroupFull[]
    },
    myId: number
}

const getPeerById = (id: number, profiles, groups) => {
    if (profiles && groups) return id > 0 ? profiles.find((profile) => profile.id === id) || null : groups.find((group => group.id === id)) || null;

    return null
}

const MessageItem = ({message, style, extraData: {profiles, groups}, myId}: MessageItemProps) => {
    const [peer, setPeer] = useState<UsersUserFull | GroupsGroupFull | null>(null)

    const isMine = message.from_id === myId

    useEffect(() => {
        const _peer = getPeerById(message.from_id, profiles, groups)

        setPeer(_peer)

    }, [profiles, groups])

    if (message.attachments && message.attachments.length > 0 && message.attachments[0].type === 'photo') {
        // console.log(message.attachments[0].photo.sizes[0].url)
    }

    return (
        <View key={`${peer}`} style={{...styles.messageContainer, flexDirection: !isMine ? 'row' : 'row-reverse', ...style}}>
            {
                !isMine && (
                    <FastImage
                      source={{uri: peer?.photo_100, priority: FastImage.priority.high, cache: 'cacheOnly'}}
                        style={styles.senderAvatar}
                    />
                    )
            }
            <View style={styles.contentContainer}>
                <View style={{minWidth: 0}}>
                    <View style={{margin: 0}}>
                        <View style={{flexDirection: 'column'}}>
                            {message.text.length > 0 && <Text style={styles.messageText} textBreakStrategy={'simple'}>{message.text}</Text>}
                            {message.attachments && message.attachments.length > 0 && message.attachments[0].type === 'photo' ?
                                (
                                    <FastImage
                                        style={{width: 100, height: 100}}
                                        source={{uri: message.attachments[0].photo.sizes[0].url || ''}}/>
                                        ) : null
                            }
                        </View>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>
                                {format(message.date * 1000, 'hh:mm')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    messageContainer: {
        display: 'flex',
        maxWidth: '90%',
        alignItems: 'flex-end',
    },
    senderAvatar: {height: 25, width: 25, backgroundColor: 'gray', borderRadius: 666, marginRight: 5},
    contentContainer: {
        padding: 10, flexWrap: 'wrap',backgroundColor: 'whitesmoke', borderRadius: 8
    },
    timeText: {
        fontSize: 11, color: 'gray'
    },
    timeContainer: {
        position: 'relative', top: 5, marginLeft: 30, alignSelf: 'flex-end'
    },
    messageText: {
        flexWrap: 'wrap',
        fontSize: 15
    }
})

export default memo(MessageItem)
