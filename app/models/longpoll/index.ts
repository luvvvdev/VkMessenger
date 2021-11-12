import { createModel } from "@rematch/core"
import { RootModel } from "../index"

type LongPollState = {
  reconnect: boolean
  updating: boolean
}

const initialState: LongPollState = {
  reconnect: true,
  updating: true,
}

const longpoll = createModel<RootModel>()({
  state: initialState,
  reducers: {
    reset: () => initialState,
    update: (state, payload?: LongPollState) => (!payload ? state : payload),
    setReconnect: (state, payload: boolean) => ({ ...state, reconnect: payload }),
    setUpdating: (state, payload: boolean) => ({ ...state, updating: payload }),
  },
})

export { longpoll }
