import {init, Models, RematchDispatch, RematchRootState} from '@rematch/core'
import persistPlugin from '@rematch/persist'

import {conversations} from './conversations'
import {user} from "./user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {history} from "./history";
import {longpoll} from "./longpoll";

export interface RootModel extends Models<RootModel> {
    conversations: typeof conversations
    user: typeof user
    history: typeof history
    longpoll: typeof longpoll
}

export const models: RootModel = {conversations, user, history, longpoll};

export const store = init({models, plugins: [persistPlugin<RootState, any, any>({key: 'root', storage: AsyncStorage})]})

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
