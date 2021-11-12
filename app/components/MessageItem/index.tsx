import { PlatformColor, StyleSheet, Text, View, ViewStyle } from "react-native"
import React, { memo, ReactNode, useMemo } from "react"
import {
  GroupsGroupFull,
  MessagesForeignMessage,
  MessagesMessage,
  UsersUserFull,
} from "../../types/vk"
import { format } from "date-fns"
import FastImage from "react-native-fast-image"
import { Attachments } from "./Attachments/Attachments"
import _ from "lodash"
import { getPeerById } from "../../utils/getPeerById"
import { MessageLoader } from "./Loader"
import { LinearGradient } from "expo-linear-gradient"
import { EmbedMessage } from "./EmbedMessage"
import { getPeerType, PeerTypes } from "../../utils/peerType"

export type MessageItemProps = {
  message: MessagesMessage
  style?: ViewStyle
  isNextMessageByCurrentId: boolean
  prevMessageByCurrentId: boolean
  myId: number
}

const MessageItem = ({
  message,
  isNextMessageByCurrentId,
  prevMessageByCurrentId,
  myId,
}: MessageItemProps) => {
  const peer: UsersUserFull | GroupsGroupFull | null = getPeerById(message.from_id)

  const textDate = format(message.date * 1000, "hh:mm")
  const isMine = message.from_id === myId
  const needToRenderAvatar = !isMine && !prevMessageByCurrentId

  const calculatedMessageContainerStyles: ViewStyle = {
    paddingLeft: needToRenderAvatar ? 15 : !isMine ? 50 : 15,
    paddingRight: isMine ? 15 : 15,
    justifyContent: isMine ? "flex-end" : "flex-start",
  }

  const avatar = (
    <FastImage
      source={{ uri: peer?.photo_100, priority: FastImage.priority.high, cache: "immutable" }}
      style={[styles.senderAvatar, { alignSelf: "flex-end" }]}
    />
  )

  let hasReply = Boolean(message.reply_message)
  let replyMessage: MessagesForeignMessage
  let replyAuthor: UsersUserFull | GroupsGroupFull | null
  let replyAuthorType: PeerTypes

  let replyAuthorName: string
  let replyText: string

  if (hasReply) {
    hasReply = true
    // @ts-ignore
    replyMessage = message.reply_message
    replyAuthorType = getPeerType(replyMessage.from_id)

    const author = getPeerById(replyMessage.from_id)

    replyAuthor = author

    switch (replyAuthorType) {
      case "user":
        replyAuthorName = `${replyAuthor?.first_name} ${replyAuthor?.last_name}`
        break
      case "group":
        replyAuthorName = `${replyAuthor?.name}`
        break
      default:
        replyAuthorName = `Not defined type name`
    }

    replyText = replyMessage.text
  }

  //<EmbedMessage author={me} text={}

  const textMessageColor = isMine ? "white" : PlatformColor("label")

  const content = (
    <View>
      {hasReply && (
        <EmbedMessage author={replyAuthorName!} text={replyText!} textColor={textMessageColor} />
      )}
      {message.text.length > 0 && (
        <Text
          style={[
            styles.messageText,
            {
              color: textMessageColor,
            },
          ]}
          // lineBreakMode={'clip'}
          // textBreakStrategy={'simple'}
        >
          {message.text}
        </Text>
      )}

      <View style={styles.messageFooter}>
        {
          // <Text style={_styles.footerText}>ред.</Text>
        }
        <Text
          style={[
            styles.footerText,
            { color: isMine ? PlatformColor("lightText") : PlatformColor("label") },
          ]}
        >
          {textDate}
        </Text>
      </View>
    </View>
  )

  let messageComponent: ReactNode

  if (!isMine) {
    messageComponent = (
      <View
        style={[
          styles.messageContent,
          {
            backgroundColor: PlatformColor("secondarySystemBackground"),
          },
        ]}
      >
        {content}
      </View>
    )
  } else {
    //background-image: linear-gradient( 109.5deg,  rgba(47,71,230,1) 11.2%, rgba(109,44,232,1) 99.8% );
    messageComponent = React.createElement(
      LinearGradient,
      {
        colors: ["rgba(47,71,230,1)", "rgba(109,44,232,1)"],
        start: { x: 0.11, y: 0 },
        end: { x: 0.998, y: 0 },
        style: styles.messageContent,
      },
      content,
    )
  }

  return (
    <View style={[styles.messageItem, calculatedMessageContainerStyles]}>
      {needToRenderAvatar ? avatar : null}
      {messageComponent}
      {message.loaded === false ? <MessageLoader /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  messageItem: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 3,
    width: "100%",
  },
  messageContent: {
    backgroundColor: "whitesmoke",
    paddingVertical: 10,
    paddingHorizontal: 10,
    height: "100%",
    borderRadius: 15,
    position: "relative",
    maxWidth: 325, // 350 * 0.12 = 42 symbols
  },
  messageText: {
    fontSize: 15,
    margin: 0,
    flexWrap: "wrap",
    lineHeight: 15,
  },
  attachmentsContainer: {
    marginTop: 5,
  },
  attachment: {
    height: 150,
    width: 150,
    backgroundColor: "gray",
    margin: 5,
  },
  footerText: {
    fontSize: 10,
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
    marginRight: -2,
    lineHeight: 1,
    bottom: -5,
  },
  senderAvatar: {
    height: 25,
    width: 25,
    backgroundColor: "gray",
    borderRadius: 666,
    marginRight: 10,
  },
})

const memoizedMessageItem = memo(MessageItem, (prevProps, nextProps) => {
  const prevMessage = prevProps.message
  const nextMessage = nextProps.message

  return _.isEqual(prevMessage, nextMessage)
})

export default memoizedMessageItem
