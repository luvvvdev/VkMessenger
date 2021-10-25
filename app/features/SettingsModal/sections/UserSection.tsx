import React from "react";
import {useDispatch} from "react-redux";
import {Dispatch} from "../../../models";
import {SectionRow} from "../types";
import {Section} from "../Section";
import {translate} from "../../../i18n";

export const UserSection = () => {
    const dispatch = useDispatch<Dispatch>()

    const rows: SectionRow[] = [
        {title: `${translate('SettingsModal.night_mode')}`},
        {title: `${translate('SettingsModal.online')}`},
        {title: `${translate('SettingsModal.logout')}`, onPress: dispatch.user.logout}
    ]

    return (
        <Section rows={rows} />
    )
}
