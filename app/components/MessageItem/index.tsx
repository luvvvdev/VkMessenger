import {ActivityIndicator, StyleSheet, Text, View, ViewStyle} from "react-native";
import React, {memo, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {GroupsGroupFull, MessagesMessage, UsersUserFull} from "../../types/vk";
import {format} from "date-fns";
import FastImage from "react-native-fast-image"
import {Attachments} from "./Attachments/Attachments";
import _ from "lodash";
import {getPeerById} from "../../utils/getPeerById";

export type MessageItemProps = {
    message: MessagesMessage
    style?: ViewStyle
    extraData: {
        profiles: UsersUserFull[]
        groups: GroupsGroupFull[]
    },
    isNextMessageByCurrentId: boolean
    prevMessageByCurrentId: boolean
    myId: number
}

const MessageItem = ({message, style, isNextMessageByCurrentId, prevMessageByCurrentId, extraData: {profiles, groups}, myId}: MessageItemProps) => {
    const peer: UsersUserFull | GroupsGroupFull | null = useMemo(() => getPeerById(message.from_id), [groups, profiles])

    const isMine = message.from_id === myId

    return (
        <View style={{...styles.messageContainer, paddingLeft: !isMine && prevMessageByCurrentId ? 25 : 0, flexDirection: !isMine ? 'row' : 'row-reverse', ...style}}>
            {
                !isMine && !prevMessageByCurrentId  ? (
                    <FastImage
                      source={{uri: peer?.photo_100, priority: FastImage.priority.high, cache: 'immutable'}}
                        style={styles.senderAvatar}
                    />
                    ) : null
            }
            {message.loaded === false ? <ActivityIndicator /> : null}
            <View style={[styles.contentContainer]}>
                <View style={{minWidth: 0}}>
                    <View style={{margin: 0}}>
                        <View style={{flexDirection: 'column'}}>
                            {message.text.length > 0 && <Text style={styles.messageText} textBreakStrategy={'simple'}>{message.text}</Text>}
                            <Attachments attachments={message.attachments} />
                        </View>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>
                                {format(message.date * 1000, 'hh:mm')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    messageContainer: {
        display: 'flex',
        maxWidth: '90%',
        alignItems: 'flex-end',
        flex: 1
    },
    senderAvatar: {height: 25, width: 25, backgroundColor: 'gray', borderRadius: 666, marginRight: 5},
    contentContainer: {
        padding: 10, flexWrap: 'wrap',backgroundColor: 'whitesmoke', borderRadius: 8
    },
    timeText: {
        fontSize: 11,
        color: 'gray'
    },
    timeContainer: {
        position: 'relative', top: 5, marginLeft: 30, alignSelf: 'flex-end'
    },
    messageText: {
        flexWrap: 'wrap',
        fontSize: 15
    }
})

export default memo(MessageItem, ((prevProps, nextProps) => {
    const prevMessage = prevProps.message
    const nextMessage = nextProps.message

    return _.isEqual(prevMessage, nextMessage)
}))
