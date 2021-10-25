/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React, {useRef} from "react"
import {
    Button,
    Text, TouchableOpacity,
    useColorScheme,
    View,
    PlatformColor
} from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {navigate, navigationRef} from "./navigation-utilities"
import LoginScreen from "../screens/Login/LoginScreen";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../models";
import ConversationScreen from "../screens/Messenger/ConversationScreen/ConversationScreen";
import {Header} from "../components";
import ConversationsScreen from "../screens/Messenger/ConversationsScreen/ConversationsScreen";
import SettingsModal from "../features/SettingsModal";
import FastImage from "react-native-fast-image";
import {translate} from "../i18n";

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
  messenger: undefined
  login: undefined
  conversation: undefined
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const AppStack = () => {
    const isLoggedIn = useSelector((state: RootState) => Boolean(state.user.login_data?.access_token))
    const userData = useSelector((state: RootState) => state.user.user_data)
    const dispatch = useDispatch<Dispatch>()

    return (
        <Stack.Navigator
            screenOptions={({navigation, route}) => ({
                headerShown: true,
                contentStyle: {
                    backgroundColor: PlatformColor('systemBackground')
                },
                headerTransparent: true,
                headerTintColor: 'white',
                headerShadowVisible: false,
                header: Header,
            })}
        >
            {
                isLoggedIn ? (
                    <>
                        <Stack.Screen name="messenger" component={ConversationsScreen} options={{
                            title: `${translate('ConversationsScreen.title')}`, headerTransparent: true, animationTypeForReplace: 'push',
                            headerLeft: () => {
                                const modalRef = useRef(null)
                                const imgSource = {
                                    method: 'GET',
                                    uri: userData?.photo_100
                                }

                                return (
                                    <View>
                                        <SettingsModal ref={modalRef} />
                                        <TouchableOpacity onPress={() => {
                                            (modalRef.current as any)?.setVisibility(true)
                                        }}>
                                            <FastImage
                                                style={{
                                                    height: 25,
                                                    width: 25,
                                                    borderRadius: 999,
                                                    backgroundColor: 'gray',
                                                }}
                                                source={imgSource}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )
                            }
                        }}/>
                        <Stack.Screen name="conversation" component={ConversationScreen} options={({route}) => (
                            {headerBackVisible: true, headerBackTitleVisible: false, headerTitleAlign: 'left', headerShown: true, headerRight: () => {
                                    const currentPeerId = useSelector<RootState, number | null>((state) => state.history.current_id)
                                    const dispatch = useDispatch<Dispatch>()

                                    if (!currentPeerId) return null

                                    const fullRefresh = () => {
                                        dispatch.history.clear({peer_id: currentPeerId})
                                        dispatch.history.get({peer_id: currentPeerId, offset: 0})
                                    }

                                    return (<Button title={'Clear'} onPress={fullRefresh} />)
                                },
                                headerTitle: () => {
                                    return (
                                            <View style={{display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row'}}>
                                                <FastImage
                                                    source={{uri: (route.params! as any).photo}}
                                                    style={{backgroundColor: PlatformColor('secondarySystemBackground'),
                                                        marginRight: 10,
                                                        height: 35,
                                                        width: 35,
                                                        borderRadius: 100
                                                    }}/>
                                                <Text
                                                    style={{
                                                        fontWeight: 'bold',
                                                        fontSize: 17,
                                                        color: PlatformColor('label')
                                                    }}>
                                                    {`${(route.params! as any).title.toString()}`}
                                                </Text>
                                            </View>
                                    )
                                },
                            })} />
                    </>
                ) : <Stack.Screen
                    name="login"
                    component={LoginScreen}
                    options={
                        {
                            title: `${translate('LoginScreen.title')}`,
                            headerLargeTitle: true,
                            headerTransparent: true
                        }}/>
            }
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
