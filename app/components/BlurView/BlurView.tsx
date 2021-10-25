import {BlurView} from "@react-native-community/blur";
import {Appearance} from "react-native";
import React from "react";

export const BView = ({children}) => (
    <BlurView blurAmount={30} blurRadius={20} blurType={Appearance.getColorScheme() || 'light'}>
        {children}
    </BlurView>
)
