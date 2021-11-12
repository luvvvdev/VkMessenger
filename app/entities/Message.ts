import {
  MessagesForeignMessage,
  MessagesMessage,
  MessagesMessageAttachment,
  WallGeo,
} from "../types/vk"
import { getPeerType } from "../utils/peerType"
import { RootState, store } from "../models"

/*
* enum MessageFlags {
    NONE = 0,
    UNREAD = 1,
    OUTBOX = 2,
    IMPORTANT = 8,
    CHAT = 16,
    FRIENDS = 32,
    SPAM = 64,
    DELETED = 128,
    AUDIO_LISTENED = 4096,
    CHAT2 = 8192,
    CANCEL_SPAM = 32768,
    HIDDEN = 65536,
    DELETED_ALL = 131072,
    CHAT_IN = 524288,
    SILENT = 1048576,
    REPLY_MSG = 2097152
}
* */

export class Message implements MessagesMessage {
  /**
   * Only for messages from community. Contains user ID of community admin, who sent this message.
   */
  admin_author_id?: number
  /**
   * Unique auto-incremented number for all messages with this peer
   */
  conversation_message_id?: number
  /**
   * Date when the message has been sent in Unixtime
   */
  date: number
  /**
   * MessageItem author's ID
   */
  from_id: number
  /**
   * MessageItem ID
   */
  id: number
  /**
   * Is it an important message
   */
  important?: boolean | number
  /**
   * this message is cropped for bot
   */
  is_cropped?: boolean | number
  /**
   * Members number
   */
  members_count?: number
  /**
   * Peer ID
   */
  peer_id: number
  /**
   * ID used for sending messages. It returned only for outgoing messages
   */
  random_id?: number
  /**
   * MessageItem text
   */
  text: string
  /**
   * Date when the message has been updated in Unixtime
   */
  update_time?: number
  /**
   * Was the audio message inside already listened by you
   */
  was_listened?: boolean | number
  /**
   * Date when the message has been pinned in Unixtime
   */
  pinned_at?: number
  /**
   * Is silent message, push without sound
   */
  is_silent?: boolean | number;
  [key: string]: any
  attachments?: MessagesMessageAttachment[]
  fwd_messages?: MessagesForeignMessage[]
  is_hidden?: boolean | number
  payload?: string
  ref?: string
  ref_source?: string
  geo?: WallGeo

  loading?: boolean
  error?: any

  constructor(message?: any) {
    if (message) {
      this.fromJSON(message)
    }
  }

  async fromArray(event: any[]) {
    const state = store.getState() as RootState
    const currentUserId = state.user.login_data?.user_id
    let peerId = event[4]
    let messageId = event[1]
    let time = event[5]
    let text = event[6]
    let messageFromId
    const randomId = event[9]

    const misc = event[8]

    const replyConversationMessageId = misc.reply
      ? JSON.parse(misc.reply).conversation_message_id
      : null

    console.log(event, event[4])

    // edit message
    if (event.length === 5) {
      // peerId = event[3]
      text = event[5]
      time = event[4]
      messageFromId = Number(event[6]["from"])
      // = messageId
      peerId = event[3]
    }

    const getSummands = (): number[] => {
      const summands: number[] = []
      const flag: number = event[2]

      for (let n of [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 65536]) {
        if (flag & n) {
          summands.push(n)
        }
      }

      return summands
    }

    const summands = getSummands() || []

    const isOutcoming = summands.includes(2)

    const peerType = getPeerType(peerId)

    switch (peerType) {
      case "chat":
        messageFromId = event[7]["from"]
        // console.log(event, event[6])
        break
      case "user":
        messageFromId = isOutcoming ? currentUserId : peerId
      case "group":
        messageFromId = isOutcoming ? currentUserId : peerId
      case "email":
        break
    }

    console.log("replyConversationId", replyConversationMessageId)
    if (replyConversationMessageId) {
      const replyMessageResponse = await global.api.getMessageByConversationId(
        peerId,
        replyConversationMessageId,
      )

      if (
        replyMessageResponse.kind === "ok" &&
        replyMessageResponse.data.response &&
        replyMessageResponse.data.response.count > 0
      ) {
        const replyMessage = replyMessageResponse.data.response.items[0]

        this.reply_message = replyMessage

        console.log("replyMessage", replyMessage)
      }
    }
    // global.api.get

    this.peer_id = peerId
    this.text = text
    this.date = time
    this.from_id = Number(messageFromId)
    this.id = messageId
    this.random_id = randomId

    // TODO: implements attachments supporting
    this.attachments = []
  }

  private fromJSON(message: MessagesMessage) {
    Object.keys(message).forEach((key) => (this[key] = message[key]))
  }

  edit(newMessage: Message) {
    Object.keys(newMessage).forEach((key) => {
      const v = newMessage[key]

      if (typeof v !== "function") {
        this[key] = v
      }
    })
  }
}
