import React, { useRef } from "react"
import { TouchableOpacity, View } from "react-native"
import SettingsModal from "../../../../features/SettingsModal"
import FastImage from "react-native-fast-image"
import { useSelector } from "react-redux"
import { RootState } from "../../../../models"

const HeaderLeft = () => {
  const userData = useSelector((state: RootState) => state.user.user_data)

  const modalRef = useRef(null)
  const imgSource = {
    method: "GET",
    uri: userData?.photo_100,
  }

  return (
    <View>
      <SettingsModal ref={modalRef} />
      <TouchableOpacity
        onPress={() => {
          ;(modalRef.current as any)?.setVisibility(true)
        }}
      >
        <FastImage
          style={{
            height: 25,
            width: 25,
            borderRadius: 999,
            backgroundColor: "gray",
          }}
          source={imgSource}
        />
      </TouchableOpacity>
    </View>
  )
}

export default HeaderLeft
