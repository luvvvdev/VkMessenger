import {BlurView} from "@react-native-community/blur";
import {Appearance} from "react-native";
import React from "react";

export const BView = ({children}) => (
    <BlurView blurAmount={80} blurRadius={20} blurType={Appearance.getColorScheme() || 'light'} reducedTransparencyFallbackColor="white">
        {children}
    </BlurView>
)
