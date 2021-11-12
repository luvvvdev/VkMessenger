import {createModel} from "@rematch/core";
import {RootModel} from "../index";
import {CustomAvatar} from "../../components/Avatar/Avatar";

type PrefsState = {
    customAvatars: {[peer_id: string]: CustomAvatar}
}

const initialState = {
    customAvatars: {}
}

const prefs = createModel<RootModel>()({
    state: initialState as PrefsState,
    reducers: {
        update: (state, payload: PrefsState) => (payload),
        addAvatar: (state, {peer_id, avatar}: {peer_id: number, avatar: CustomAvatar}) => (
            {...state, customAvatars: {...state.customAvatars, [peer_id]: avatar}}
        )
    }
})

export {prefs}
