import React from "react";
import {useDispatch} from "react-redux";
import {Dispatch} from "../../../models";
import {SectionRow} from "../types";
import {Section} from "../Section";
import {translate, TxKeyPath} from "../../../i18n";

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

    const rows: SectionRow[] = [
        {title: `${translate('SettingsModal.debug_clear_all' as TxKeyPath)}`, onPress: cleanAll },
        {title: `${translate('SettingsModal.debug_clear_conversations' as TxKeyPath)}`, onPress: reloadConversationsCache},
        {title: `${translate('SettingsModal.debug_clear_messages' as TxKeyPath)}`, onPress: () => dispatch.history.reset()}
    ]

    return (
        <Section header={'Разработчик'} rows={rows} />
    )
}

