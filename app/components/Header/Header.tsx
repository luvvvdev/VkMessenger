import {PlatformColor, StyleSheet, Text, TouchableOpacity, View, ViewStyle} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import React from "react";
import {NativeStackHeaderProps} from "@react-navigation/native-stack/lib/typescript/src/types";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import { BlurView, VibrancyView } from "@react-native-community/blur";

const Header = (props: NativeStackHeaderProps) => {
  const insets = useSafeAreaInsets()

  return (
          <View style={[styles.container, {
            height: insets.top + 50,
            paddingTop: insets.top,}]}
          >
            <View style={[styles.left, {
              flex: props.options.headerTitleAlign === 'left' ? 0 : 1,
              marginRight: props.options.headerTitleAlign === 'left' ? 15 : 0,}]}
            >{
              props.options.headerBackVisible && props.navigation.canGoBack() ? (
                  <TouchableOpacity onPress={props.navigation.goBack}>
                    <Icon name={'chevron-left'} color={PlatformColor('link')} size={26}/>
                    {props.back?.title && props.options.headerBackTitleVisible && (<Text>{props.back?.title}</Text>)}
                  </TouchableOpacity>
              ) : (props.options.headerLeft && props.options.headerLeft({tintColor: props.options.headerTintColor}))
            }</View>
            <View style={[styles.center, {justifyContent: props.options.headerTitleAlign === 'left' ? 'flex-start' : 'center',}]}>
              {
                typeof props.options.headerTitle === 'function' ?
                    props.options.headerTitle({tintColor: props.options.headerTintColor, children: props.options.title || props.route.name})
                    :
                  (
                      <Text style={styles.title}>{props.options.title}</Text>
                  )}
            </View>
            <View style={styles.right}>{props.options.headerRight && props.options.headerRight({tintColor: props.options.headerTintColor})}</View>
          </View>
  )
}

const styles = StyleSheet.create({
  title: {
    color: PlatformColor('label'),
    fontWeight: '700',
    fontSize: 18,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    width: '100%',
    backgroundColor: PlatformColor('systemBackground'),
    opacity: 1,
    zIndex: 2,
  },
  left: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  center: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export {Header}
