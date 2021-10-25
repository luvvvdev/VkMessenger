import {PlatformColor, StyleSheet, Text, View, ViewStyle} from "react-native";
import React, {memo, ReactNode, useMemo} from "react";
import {GroupsGroupFull, MessagesMessage, UsersUserFull} from "../../types/vk";
import {format} from "date-fns";
import FastImage from "react-native-fast-image"
import {Attachments} from "./Attachments/Attachments";
import _ from "lodash";
import {getPeerById} from "../../utils/getPeerById";
import {MessageLoader} from "./Loader";
import {LinearGradient} from "expo-linear-gradient";

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
    const textDate = format(message.date * 1000, 'hh:mm')
    const isMine = message.from_id === myId
    const needToRenderAvatar = !isMine && !prevMessageByCurrentId

    const calculatedMessageContainerStyles: ViewStyle = {
        paddingLeft: needToRenderAvatar ? 15 : (!isMine ? 50 : 15),
        paddingRight: isMine ? 15 : 15,
        //flexDirection: isMine ? 'row-reverse' : 'row'
        justifyContent: isMine ? 'flex-end' : 'flex-start'
    }

    const avatar = <FastImage
        source={{uri: peer?.photo_100, priority: FastImage.priority.high, cache: 'immutable'}}
        style={[styles.senderAvatar, {alignSelf: 'flex-end'}]}
    />

    /*
    * const content = (
        <View style={{minWidth: 0}}>
            <View style={{margin: 0, flexDirection: 'column', width: '100%'}}>
                <View style={{flexDirection: 'column'}}>
                    {message.text.length > 0 &&
                    <Text lineBreakMode={'clip'} style={styles.messageText} textBreakStrategy={'simple'}>{message.text}</Text>
                    }
                    <Attachments attachments={message.attachments} />
                </View>
                <View style={styles.timeContainer}>
                    <Text style={[styles.timeText, {color: isMine ? PlatformColor('lightText') : PlatformColor('label')}]}>
                        {textDate}
                    </Text>
                </View>
            </View>
        </View>
    )*/

    const content = (
                <View>
                    <Text
                        style={styles.messageText}
                        lineBreakMode={'clip'}
                        textBreakStrategy={'simple'}
                    >
                        {message.text}
                    </Text>
                    <View style={styles.messageFooter}>
                        {
                            // <Text style={_styles.footerText}>ред.</Text>
                        }
                        <Text style={[
                                styles.footerText,
                                {color: isMine ? PlatformColor('lightText') : PlatformColor('label')}]
                        }
                        >
                            {textDate}
                        </Text>
                    </View>
                </View>
    )

    let messageComponent: ReactNode;

    if (!isMine) {
        messageComponent = React.createElement(View, {
            style: [styles.messageContent, {
                backgroundColor: PlatformColor('secondarySystemBackground')
            }]
        }, content)
    } else {
        messageComponent = React.createElement(LinearGradient, {
            colors: ['rgba(93,72,230,1)', 'rgba(114,82,226,1)'],
            start: {x: 0.2, y: 1.5},
            style: styles.messageContent
        }, content)
    }


    return <View style={[styles.messageItem, calculatedMessageContainerStyles]}>
        { needToRenderAvatar ? avatar : null }
        {messageComponent}
        { message.loaded === false ? <MessageLoader /> : null }
    </View>
}

const styles = StyleSheet.create({
    messageItem: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        flexDirection: "row",
        paddingHorizontal: 10,
        paddingVertical: 5,
        width: '100%'
    },
    messageContent: {
        backgroundColor: "whitesmoke",
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: "100%",
        borderRadius: 10,
        position: "relative",
        maxWidth: 360 // 350 * 0.12 = 42 symbols
    },
    messageText: {
        fontSize: 15,
        margin: 0,
        flexWrap: "wrap",
        lineHeight: 15,
        color: PlatformColor('label')
    },
    attachmentsContainer: {
        marginTop: 5
    },
    attachment: {
        height: 150,
        width: 150,
        backgroundColor: "gray",
        margin: 5
    },
    footerText: {
        fontSize: 10
    },
    messageFooter: {
        position: "relative",
        right: 0,
        borderRadius: 0.625,
        paddingHorizontal: 0.25,
        maxWidth: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
        marginLeft: 10,
        marginRight: -5,
        lineHeight: 1,
        bottom: -5
    },
    senderAvatar: {
        height: 25,
        width: 25,
        backgroundColor: 'gray',
        borderRadius: 666,
        marginRight: 10
    },
})

/*
* const styles = StyleSheet.create({
    messageContainer: {
        display: 'flex',
        // maxWidth: '100%',
        alignItems: 'flex-end',
        flex: 1,
        paddingLeft: 0,
        paddingRight: 0
    },
    contentContainer: {
        flexWrap: 'wrap',
        borderRadius: 15,
        paddingRight: 10,
        paddingLeft: 10,
        paddingTop: 15,
        paddingBottom: 5,
    },
    timeText: {
        fontSize: 11,
        marginBottom: 5,
        marginLeft: 3
    },
    timeContainer: {
        position: 'relative',
        top: 0,
        marginTop: 0,
        marginLeft: 30,
        padding: 0,
        alignSelf: 'flex-end'
    },
    messageText: {
        flexWrap: 'wrap',
        color: PlatformColor('label'),
        fontSize: 15
    },

})*/

const memoizedMessageItem = memo(MessageItem, ((prevProps, nextProps) => {
    const prevMessage = prevProps.message
    const nextMessage = nextProps.message

    return _.isEqual(prevMessage, nextMessage)
}))

export default memoizedMessageItem
