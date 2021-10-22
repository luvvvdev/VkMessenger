import {init, Models, RematchDispatch, RematchRootState} from '@rematch/core'
import AsyncStorage from "@react-native-async-storage/async-storage";
import persistPlugin from '@rematch/persist'
import loadingPlugin, {ExtraModelsFromLoading} from '@rematch/loading'

import {conversations} from './conversations'
import {user} from "./user";
import {history} from "./history";

export type FullModel = ExtraModelsFromLoading<RootModel, {type: 'full'}>

export interface RootModel extends Models<RootModel> {
    conversations: typeof conversations
    user: typeof user
    history: typeof history
}

export const models: RootModel = {conversations, user, history};

export const store = init<RootModel, FullModel>({models, plugins: [
        persistPlugin<RootState, any, any>({
            key: 'root', storage: AsyncStorage,
        }),
        loadingPlugin({type: 'full'})
    ]})

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel, FullModel>;
