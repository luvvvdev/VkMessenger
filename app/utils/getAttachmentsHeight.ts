import {MessagesMessageAttachment} from "../types/vk";

export const getAttachmentsHeight = (attachments: MessagesMessageAttachment[] | undefined): number => {
    const attachmentRowHeight = 220

    if (!attachments) return 0

    if (attachments.length === 1) return attachmentRowHeight

    return (attachments.length / 2) * 150
}
