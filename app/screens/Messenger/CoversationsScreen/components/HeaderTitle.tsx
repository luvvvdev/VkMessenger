import { useSelector } from "react-redux"
import { RootState } from "../../../../models"
import { translate } from "../../../../i18n"
import { ActivityIndicator } from "react-native"
import React from "react"
import { Div, Text } from "react-native-magnus"

const HeaderTitle = () => {
  const updating = useSelector<RootState, boolean>((state) => state.longpoll.updating)
  const reconnect = useSelector<RootState, boolean>((state) => state.longpoll.reconnect)

  let title: string

  if (updating) {
    title = `${translate("common.updating")}`
  } else if (reconnect) {
    title = `${translate("common.connecting")}`
  } else {
    title = `${translate("ConversationsScreen.title")}`
  }

  return (
    <Div row>
      {updating && (
        <Div ml={-20}>
          <ActivityIndicator />
        </Div>
      )}
      <Text fontSize={"xl"} fontWeight={"600"} ml={5}>
        {title}
      </Text>
    </Div>
  )
}

export default HeaderTitle
