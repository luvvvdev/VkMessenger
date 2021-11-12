import { MessagesConversationPeerType } from "../types/vk"

export type PeerTypes = MessagesConversationPeerType

export const getPeerType = (peer_id: number): PeerTypes => {
  if (peer_id < 0 || (peer_id < 2000000000 && peer_id >= 1000000000)) {
    return "group"
  } else if (peer_id >= 2000000000) {
    return "chat"
  } else {
    return "user"
  }
}
