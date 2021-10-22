import React from "react";
import {ActivityIndicator, View} from "react-native";

export const Lazy = ({children}) => {
    const fallback = (
        <View style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator/>
        </View>
    )

    return (
        <React.Suspense fallback={fallback}>
            {children}
        </React.Suspense>
    )
}
