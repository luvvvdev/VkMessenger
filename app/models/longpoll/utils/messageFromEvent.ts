import { MessagesMessage } from "../../../types/vk"
import { getPeerType } from "../../../utils/peerType"

export const getMessageByEvent = (messageEvent: any[], currentUserId: number): MessagesMessage => {
  const peerId = messageEvent[4]
  const messageId = messageEvent[1]
  const time = messageEvent[5]
  const text = messageEvent[6]

  const getSummands = (): number[] => {
    const summands: number[] = []
    const flag: number = messageEvent[2]

    for (let n of [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 65536]) {
      if (flag & n) {
        summands.push(n)
      }
    }

    return summands
  }

  let messageFromId

  const summands = getSummands()

  const isOutcoming = summands.includes(2)

  const peerType = getPeerType(peerId)

  switch (peerType) {
    case "chat":
      messageFromId = messageEvent[7]["from"]
      console.log(messageEvent, messageEvent[6])
      break
    case "user":
      messageFromId = isOutcoming ? currentUserId : peerId
    case "group":
      messageFromId = isOutcoming ? currentUserId : peerId
    case "email":
      break
  }

  return {
    peer_id: peerId,
    text,
    date: time,
    from_id: messageFromId,
    id: messageId,
    attachments: [],
  }
}
