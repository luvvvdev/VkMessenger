import { useSelector } from "react-redux"
import { RootState } from "../../../../models"
import { Avatar, CustomAvatar } from "../../../../components/Avatar/Avatar"
import { getPeerById } from "../../../../utils/getPeerById"
import { PlatformColor, Text, View } from "react-native"
import React from "react"

const HeaderTitle = ({ route }) => {
  const conversation = (route.params! as any).conversation
  const customAvatar = useSelector<RootState, CustomAvatar | undefined>((state) => {
    return state.prefs.customAvatars[conversation.peer.id]
  })

  const type = conversation.peer.type

  let photo = conversation.chat_settings?.photo?.photo_100

  if (type !== "chat") {
    const peer = getPeerById(conversation.peer.id)

    if (type === "group") {
      photo = peer?.photo_100
    } else if (type === "user") {
      photo = peer?.photo_100
    }
  }

  let underTitle = ""

  switch (type) {
    case "user":
      underTitle = "online"
      break
    case "chat":
      underTitle = `${conversation.chat_settings.members_count} members`
      break
    default:
      break
  }

  return (
    <View
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "transparent",
        flexDirection: "row",
      }}
    >
      <Avatar
        url={photo}
        custom={customAvatar}
        // @ts-ignore
        size={35}
        style={{ marginRight: 10 }}
      />
      <View>
        <Text
          numberOfLines={1}
          // lineBreakMode={'tail'}
          ellipsizeMode={"tail"}
          style={{
            width: 150,
            fontWeight: "bold",
            fontSize: 16,
            color: PlatformColor("label"),
          }}
        >
          {`${(route.params! as any).title.toString()}`}
        </Text>
        {underTitle.length > 0 && (
          <Text style={{ color: PlatformColor("secondaryLabel") }}>{underTitle}</Text>
        )}
      </View>
    </View>
  )
}

export default HeaderTitle
