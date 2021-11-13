/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React, { useRef } from "react"
import { Button, Text, TouchableOpacity, useColorScheme, View, PlatformColor } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { navigate, navigationRef } from "./navigation-utilities"
import LoginScreen from "../screens/Login/LoginScreen"
import { useDispatch, useSelector } from "react-redux"
import { Dispatch, RootState } from "../models"
import ConversationScreen from "../screens/Messenger/ConversationScreen/ConversationScreen"
import { Header } from "../components"
import ConversationsScreen from "../screens/Messenger/CoversationsScreen/ConversationsScreen"
import ImageViewModal from "../screens/Messenger/ImageViewModal"

import { translate } from "../i18n"

import HeaderRight from "../screens/Messenger/ConversationScreen/components/HeaderRight"
import HeaderTitle from "../screens/Messenger/ConversationScreen/components/HeaderTitle"
import ConversationsHeaderTitle from "../screens/Messenger/CoversationsScreen/components/HeaderTitle"
import HeaderLeft from "../screens/Messenger/CoversationsScreen/components/HeaderLeft"
import { ImageSource } from "react-native-vector-icons/Icon"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type NavigatorParamList = {
  Conversations: undefined
  Login: undefined
  Conversation: undefined
  ImageView: { image: ImageSource }
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const AppStack = () => {
  const isLoggedIn = useSelector((state: RootState) => Boolean(state.user.login_data?.access_token))
  const dispatch = useDispatch<Dispatch>()

  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        contentStyle: {
          backgroundColor: PlatformColor("systemBackground"),
        },
        headerTransparent: true,
        headerStyle: {
          backgroundColor: "red",
        },
        //headerBlurEffect: "extraLight",
        headerShadowVisible: false,
        header: Header,
        gestureEnabled: true,
      })}
    >
      {!isLoggedIn && (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: `${translate("LoginScreen.title")}`,
            headerLargeTitle: true,
            headerTransparent: true,
          }}
        />
      )}
      <Stack.Group>
        <Stack.Screen
          name="Conversations"
          component={ConversationsScreen}
          options={{
            headerTitle: ConversationsHeaderTitle,
            animationTypeForReplace: "push",
            headerLeft: HeaderLeft,
          }}
        />
        <Stack.Screen
          name="Conversation"
          component={ConversationScreen}
          options={({ route }) => ({
            headerBackVisible: true,
            headerBackTitleVisible: false,
            headerBlurEffect: "light",
            headerTitleAlign: "left",
            headerShown: true,
            headerRight: HeaderRight,
            headerTitle: () => <HeaderTitle route={route} />,
          })}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: "modal",
          gestureEnabled: true,
          //animation: "fade",
          animationTypeForReplace: "pop",
          headerShown: false,
        }}
      >
        <Stack.Screen name="ImageView" component={ImageViewModal} />
      </Stack.Group>
    </Stack.Navigator>
  )
}

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = (props: NavigationProps) => {
  const colorScheme = useColorScheme()

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
}

AppNavigator.displayName = "AppNavigator"

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["messenger"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
