import React from "react"
import { Button, Div, Text } from "react-native-magnus"
import FastImage from "react-native-fast-image"

function ImageViewModal({ route }) {
  return (
    <Div justifyContent={"center"} bg={"black"} alignItems={"center"} w={"100%"}>
      <Div w={"100%"} h={"100%"}>
        <FastImage resizeMode={"contain"} style={{ flex: 1 }} source={route.params.image} />
      </Div>
    </Div>
  )
}

export default ImageViewModal
