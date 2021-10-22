import React from "react";
import {ActivityIndicator, View, Dimensions,} from "react-native";
import {useSafeAreaInsets, SafeAreaView} from "react-native-safe-area-context";

const Screen = ({children}) => {
    const insets = useSafeAreaInsets()
    const dimensions = Dimensions.get('screen')

    const fallback = (
        <View style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator/>
        </View>
    )

    return (
        <React.Suspense fallback={fallback}>
            <SafeAreaView style={{
                paddingRight: 20,
                paddingLeft: 20,
                // paddingBottom: insets.bottom + insets.bottom * 0.1,
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                // height: dimensions.height - insets.bottom * 3
            }} edges={["bottom"]}>
                    {children}
            </SafeAreaView>
        </React.Suspense>)

}

export default Screen
