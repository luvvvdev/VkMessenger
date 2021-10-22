import React, { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type PanelProps = {
  children: ReactNode,
  title: string,
}

const Panel = ({children, title}: PanelProps) => {
  const style: StyleProp<ViewStyle> = {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%'
  }

  return (
    <View style={style}>
      {children}
    </View>
  )
}

export {Panel}
