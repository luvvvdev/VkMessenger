import { store, Store } from "../../../models"
import { MessagesMessage } from "../../../types/vk"

class MessagesService {
  private store: Store

  constructor() {
    this.store = store
  }

  get state() {
    return this.store.getState()
  }

  get dispatch() {
    return this.store.dispatch
  }

  add(peer_id: number, message: MessagesMessage) {
    const targetHistory = this.state.history.items[message.peer_id]

    if (!targetHistory) return

    this.dispatch.history.update({
      ...this.state.history,
      items: {
        [message.peer_id]: {
          ...targetHistory,
          count: targetHistory.count + 1,
          items: [message, ...targetHistory.items],
        },
      },
    })
  }
}
