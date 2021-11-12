import React from "react"
import { useDispatch } from "react-redux"
import { Dispatch } from "../../../models"
import { SectionRow } from "../types"
import { Section } from "../Section"
import { translate } from "../../../i18n"
import Icon from "react-native-vector-icons/Ionicons"
import { Platform, PlatformColor } from "react-native"

export const UserSection = () => {
  const dispatch = useDispatch<Dispatch>()

  const rows: SectionRow[] = [
    {
      title: `${translate("SettingsModal.night_mode")}`,
      leading: {
        icon: <Icon name={"ios-moon"} color={PlatformColor("label")} size={18} />,
        color: PlatformColor("secondarySystemFill"),
      },
    },
    {
      title: `${translate("SettingsModal.online")}`,
      leading: {
        icon: <Icon name={"eye"} size={18} color={"white"} />,
        color: "rgb(63, 215, 74)",
      },
    },
    { title: `${translate("SettingsModal.logout")}`, onPress: dispatch.user.logout },
  ]

  return <Section rows={rows} />
}
