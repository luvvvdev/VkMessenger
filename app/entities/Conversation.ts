import {MessagesConversation, MessagesConversationPeer} from "../types/vk";

export class Conversation implements MessagesConversation {
    /**
     * ID of the last message in conversation
     */
    last_message_id: number;
    /**
     * ConversationScreen message ID of the last message in conversation
     */
    last_conversation_message_id?: number;
    /**
     * Last message user have read
     */
    in_read: number;
    /**
     * Last outcoming message have been read by the opponent
     */
    out_read: number;
    /**
     * Unread messages number
     */
    unread_count?: number;
    /**
     * Is this conversation uread
     */
    is_marked_unread?: boolean | number;
    /**
     * MessageItem id of message with mention
     */
    mentions?: number[];
    [key: string]: any;
    peer: MessagesConversationPeer
    important?: boolean | number;
    unanswered?: boolean | number;
    special_service_type?: "business_notify";

    constructor(conversation: MessagesConversation) {
        Object.keys(conversation).forEach((key) => this[key] = conversation[key])
    }

    edit(newConversation: Conversation) {
        Object.keys(newConversation).forEach((key) => {
            const v = newConversation[key]

            if (typeof v !== 'function') {
                this[key] = v
            }
        })
    }

    /* isChat = () => this.peer.type === 'chat'
    isGroup = () => this.peer.type === 'group'
    isUser = () => this.peer.type === 'user' */

}
