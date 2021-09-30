import React from 'react'
import {StyleProp, TextInput, TextInputProps, TextStyle} from "react-native";

interface TextFieldProps extends TextInputProps {
    variant: TextFieldVariant
}

type TextFieldVariant = 'primary' | 'transparent'

const TextField = ({variant, style, ...rest}: TextFieldProps) => {
    const variants: Record<TextFieldVariant, StyleProp<TextStyle>> = {
        primary: {
            backgroundColor: '#EBEBEB',
            padding: 10,
            borderRadius: 5,

        },
        transparent: {
            backgroundColor: 'transparent'
        }
    }

    return <TextInput style={{...variants[variant] as object, ...style as object}} {...rest} placeholderTextColor={'#AFB3C4'}/>
}

export {TextField}
