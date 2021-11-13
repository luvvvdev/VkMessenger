import {
  FlatList,
  LogBox,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  VirtualizedList,
} from "react-native"
import FastImage from "react-native-fast-image"
import React, { memo, useEffect } from "react"
import { MessagesMessageAttachment, MessagesMessageAttachmentType } from "../../../types/vk"
import _ from "lodash"
import { getAttachmentsHeight } from "../../../utils/getAttachmentsHeight"
import { FlatGrid } from "react-native-super-grid"
import { Div } from "react-native-magnus"
import { useNavigation } from "@react-navigation/native"

/*     {attachments && attachments.length > 0 && attachments[0].type === 'photo' ?
        (
         : null
*/

type AttachmentsProps = {
  attachments?: MessagesMessageAttachment[]
}

LogBox.ignoreLogs([/(?:console.error: VirtualizedLists should never be nested inside plain)/gm])

export const Attachments = memo(
  ({ attachments }: AttachmentsProps) => {
    if (!attachments) return null

    const navigation = useNavigation()

    const height = getAttachmentsHeight(attachments)

    const attachmentWidth = attachments.length === 1 ? 220 : 150
    const attachmentStyle = {
      ...styles.attachment,
      width: attachmentWidth,
      maxWidth: attachmentWidth,
    }

    const renderPhoto = (attachment: MessagesMessageAttachment, isSecond: boolean) => {
      const source = {
        headers: {
          access_key: attachment.photo.access_key,
        },
        uri: attachment.photo.sizes[3].url || "",
        // cache: 'immutable',
        priority: FastImage.priority.high,
      }

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("ImageView", { image: source })}
        >
          <FastImage
            resizeMode={"cover"}
            style={{ width: "100%", height: "100%", backgroundColor: "gray" }}
            source={source}
          />
        </TouchableOpacity>
      )
    }

    const rows = _.chunk(attachments, 2)

    const renderAttachment = (attachment: MessagesMessageAttachment) => {
      switch (attachment.type) {
        case "photo":
          return (
            <Div w={220} h={160} mb={5} rounded={5} overflow={"hidden"}>
              {renderPhoto(attachment, false)}
            </Div>
          )
        default:
          return <View style={{ height: 150, width: 150, backgroundColor: "gray" }}></View>
      }
    }

    const renderedRows = () =>
      rows.map((row, i) => {
        return <Div key={i}>{row.map((item) => renderAttachment(item))}</Div>
      })

    return <Div w={"100%"}>{renderedRows()}</Div>
  },
  (prevProps, nextProps) => _.isEqual(prevProps, nextProps),
)

const styles = StyleSheet.create({
  attachmentsContainer: {
    width: "100%",
  },
  attachment: {
    width: 150,
    height: "100%",
    maxWidth: 150,
    maxHeight: "100%",
  },
})

/* ({ item: attachment, index }) => {
          let child: React.ReactNode = null

          switch (attachment.type) {
            case "photo":
              child = renderPhoto(attachment, index % 2 === 0 ? true : false)
              break
            default:
              child = <View style={{ height: "100%", width: 150, backgroundColor: "gray" }}></View>
              break
          }

          return (
            <View style={attachmentStyle} key={`attachment-${attachment.type}-${index}`}>
              {child}
            </View>
          )
        }*/
