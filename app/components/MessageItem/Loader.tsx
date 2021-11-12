import { ActivityIndicator, Animated, Easing, StyleSheet, View } from "react-native"
import React, { useEffect, useLayoutEffect, useRef } from "react"

export const MessageLoader = () => {
  const opacityValue = useRef(new Animated.Value(0)).current
  // const size = useRef(new Animated.ValueXY({x: 0, y: 0})).current

  useLayoutEffect(() => {
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View style={[styles.loader, { opacity: opacityValue }]}>
      <ActivityIndicator />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  loader: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
})
