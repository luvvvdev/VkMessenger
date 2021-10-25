import {TextStyle} from "react-native";

export type CurrentTheme = 'light' | 'dark'
export type Theme = {
    colors: {
        primary: string
        background: string
        secondary: string
    }

    fonts: {
        primary: TextStyle
        secondary: TextStyle,
        title: TextStyle
    }
}

const initialValue = {
    current: 'light',
}

