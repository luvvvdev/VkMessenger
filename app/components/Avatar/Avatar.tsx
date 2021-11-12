import FastImage, { ImageStyle, Source } from "react-native-fast-image"
import React, { memo, useRef } from "react"
import { PlatformColor, StyleSheet, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import _ from "lodash"

type AvatarProps = {
  url?: string
  size: number
  style?: ImageStyle
  custom?: CustomAvatar
}

export type CustomAvatar = {
  gradient: string[]
  text: string
}

export const Avatar = memo(({ url, size, style, custom }: AvatarProps) => {
  const source: Source = {
    uri: url,
    priority: FastImage.priority.high,
    cache: "immutable",
  }

  const calculatedStyles = { height: size, width: size, ...style }

  if (!url && custom)
    return (
      <View style={{ ...styles.avatar, ...styles.initialAvatar, ...calculatedStyles }}>
        <LinearGradient
          colors={custom.gradient}
          style={{ width: "100%", height: "100%", ...styles.initialAvatar }}
        >
          <Text style={{ textAlign: "center", fontSize: 20 }}>{custom.text}</Text>
        </LinearGradient>
      </View>
    )

  return (
    <FastImage
      source={source}
      // @ts-ignore
      style={[styles.avatar, style, calculatedStyles]}
    />
  )
})

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: PlatformColor("secondarySystemBackground"),
    borderRadius: 666,
    overflow: "hidden",
  },
  initialAvatar: {
    justifyContent: "center",
    alignItems: "center",
  },
})
