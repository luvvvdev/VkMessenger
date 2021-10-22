import {MessagesConversation, MessagesConversationWithMessage, MessagesMessage} from "../types/vk";
import {Conversation} from "./Conversation";
import {Message} from "./Message";

export class ConversationWithMessage implements MessagesConversationWithMessage {
    [key: string]: any;
    conversation: Conversation
    last_message: Message

    constructor(conversation: MessagesConversation, last_message: MessagesMessage) {
        this.conversation = new Conversation(conversation)
        this.last_message = new Message(last_message)
    }

    editConversation(newConversation: Conversation) {
        this.conversation.edit(newConversation)
    }

    editLastMessage(newMessage: Message) {
        this.last_message.edit(newMessage)
    }
}
