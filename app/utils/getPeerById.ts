import {getPeerType, PeerTypes} from "./peerType";
import _ from "lodash";
import {GroupsGroupFull, UsersUserFull} from "../types/vk";
import {store} from "../models";

export const getPeerById = (id: number): UsersUserFull | GroupsGroupFull | null => {
    const {conversations} = store.getState()
    const type: PeerTypes = getPeerType(id)

    if (type === 'user') {
        return _.find(conversations.profiles || [], (profile) => Math.abs(profile.id) === Math.abs(id))
    } else if (type === 'group') {
        return _.find(conversations.groups || [], (group) => Math.abs(group.id) === Math.abs(id))
    }

    return null
}
