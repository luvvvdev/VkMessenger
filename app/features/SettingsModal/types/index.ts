import {ReactNode} from "react";

export type SectionRow = {
    title: string
    onPress?: () => void
    leading?: {
        icon?: ReactNode
        color?: any
    }
}
