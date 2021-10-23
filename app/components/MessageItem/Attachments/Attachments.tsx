import {StyleSheet, Text, View} from "react-native";
import FastImage from "react-native-fast-image";
import React from "react";
import {MessagesMessageAttachment} from "../../../types/vk";
import _ from "lodash";
import {getAttachmentsHeight} from "../../../utils/getAttachmentsHeight";

/*     {attachments && attachments.length > 0 && attachments[0].type === 'photo' ?
        (
         : null
*/

type AttachmentsProps = {
    attachments?: MessagesMessageAttachment[]
}

export const Attachments = ({attachments}: AttachmentsProps) => {

    if (!attachments) return null

    const height = getAttachmentsHeight(attachments)

    const attachmentWidth = attachments.length === 1 ? 220 : 150
    const attachmentStyle = {...styles.attachment, width: attachmentWidth, maxWidth: attachmentWidth}

    const renderPhoto = (attachment: MessagesMessageAttachment, isSecond: boolean) => (
        <FastImage
            resizeMode={'cover'}
            style={{marginLeft: !isSecond ? 5 : 0}}
            source={{uri: attachment.photo.sizes[3].url || '', cache: 'cacheOnly'}}/>
    )

    const children = attachments.map((attachment, index, arr) => {
        let child: React.ReactNode = null;

        switch (attachment.type) {
            case "photo":
                child = renderPhoto(attachment, index % 2 === 0 ? true : false)
                break;
            default:
                child = <View style={{height: '100%', width: 150, backgroundColor: 'gray'}}></View>
                break;
        }

        return <View style={attachmentStyle} key={`attachment-${attachment.type}-${index}`}>{child}</View>
    })

    const rows = _.chunk(children, 2).map((c, i, arr) => (
        <View style={{flexDirection: 'row', marginBottom: arr[i + 1] ? 5 : 0}} key={`attachments-row-${i}`}>
            {c}
        </View>
    ))

    return (
        <View style={[styles.attachmentsContainer, {height}]}>
            {rows}
        </View>
    )
}

const styles = StyleSheet.create({
    attachmentsContainer: {
        width: '100%'
    },
    attachment: {
        width: 150,
        height: '100%',
        maxWidth: 150,
        maxHeight: '100%'
    }
})
