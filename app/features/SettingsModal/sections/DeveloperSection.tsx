import React from "react";
import * as UIKit from 'react-native-ios-kit'
import {useDispatch} from "react-redux";
import {Dispatch} from "../../../models";

export const DeveloperSection = () => {
    const dispatch = useDispatch<Dispatch>()

    const cleanAll = async () => {
        dispatch.conversations.reset()
        dispatch.history.reset()

        await dispatch.conversations.get()
    }

    const reloadConversationsCache = async () => {
        await dispatch.conversations.reset()
        setTimeout(async () => await dispatch.conversations.get(), 1000)
    }

    return (
        <UIKit.TableView header={'Разработчик'}>
            <UIKit.RowItem title={'Очистить все'} onPress={cleanAll}/>
            <UIKit.RowItem title={'Очистить кэш бесед'} onPress={reloadConversationsCache}/>
            <UIKit.RowItem title={'Очистить кэш переписок'} onPress={() => dispatch.history.reset()}/>
        </UIKit.TableView>
    )
}
