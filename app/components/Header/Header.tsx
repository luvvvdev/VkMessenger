import { Text, TouchableOpacity, View, ViewStyle} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import React from "react";
import {NativeStackHeaderProps} from "@react-navigation/native-stack/lib/typescript/src/types";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const Header = (props: NativeStackHeaderProps) => {
  const insets = useSafeAreaInsets()

  const styles: Record<string, ViewStyle> = {
    container: {
      display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
      paddingLeft: 15, paddingRight: 15, alignItems: 'center', width: '100%', height: insets.top + 50,
      backgroundColor: 'white', opacity: 1, zIndex: 2, paddingTop: insets.top
    },
    left: {
      flex: props.options.headerTitleAlign === 'left' ? 0 : 1,
      marginRight: props.options.headerTitleAlign === 'left' ? 15 : 0,
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
      justifyContent: props.options.headerTitleAlign === 'left' ? 'flex-start' : 'center',
      alignItems: 'center',
    },
  }

  return (
          <View style={styles.container}>
            <View style={styles.left}>{
              props.options.headerBackVisible && props.navigation.canGoBack() ? (
                  <TouchableOpacity onPress={props.navigation.goBack}>
                    <Icon name={'chevron-left'} size={26}/>
                    {props.back?.title && props.options.headerBackTitleVisible && (<Text>{props.back?.title}</Text>)}
                  </TouchableOpacity>
              ) : (props.options.headerLeft && props.options.headerLeft({tintColor: props.options.headerTintColor}))
            }</View>
            <View style={styles.center}>
              {typeof props.options.headerTitle === 'function' ? props.options.headerTitle({tintColor: props.options.headerTintColor, children: props.options.title || props.route.name}) :
                  (
                      <Text style={{fontWeight: '600', fontSize: 17}}>{props.options.title}</Text>
                  )}
            </View>
            <View style={styles.right}>{props.options.headerRight && props.options.headerRight({tintColor: props.options.headerTintColor})}</View>
          </View>
  )
}

export {Header}
