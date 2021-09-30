import React, { ReactNode } from "react";
import { StyleProp, Text, TextStyle, View } from "react-native";

type HeaderProps = {
  children?: ReactNode
  variant?: HeaderVariant
  trailing?: ReactNode
}

type HeaderVariant = 'secondary'

const Header = ({children, variant = 'secondary', trailing}: HeaderProps) => {
  const variants: Record<HeaderVariant, StyleProp<TextStyle>> = {
    secondary: {color: 'gray', textTransform: 'uppercase', fontWeight: '500', marginBottom: 10}
  }

  const style: StyleProp<TextStyle> = {...variants[variant] as Record<any, any>}

  return (
    <View  style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
      <Text style={{...style}}>
        {children}
      </Text>
      {trailing ? <View>
        {trailing}
      </View> : null}
    </View>
  )
}

export {Header}
