import React from "react";
import {ActivityIndicator, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const Screen = ({children}) => {
    const insets = useSafeAreaInsets()

    const fallback = (
        <View style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator/>
        </View>
    )

    return (
        <React.Suspense fallback={fallback}>
            <View style={{
                paddingRight: 20,
                paddingLeft: 20,
                paddingBottom: insets.bottom + insets.bottom * 0.1,
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                height: '92%'
            }}>
                    {children}
            </View>
        </React.Suspense>)

}

export default Screen
