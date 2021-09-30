import React, { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Header } from "../Header/Header";

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
      <Header>{title}</Header>
      {children}
    </View>
  )
}

export {Panel}
