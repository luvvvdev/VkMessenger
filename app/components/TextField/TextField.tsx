import React, { forwardRef } from "react"
import { PlatformColor, StyleProp, TextInput, TextInputProps, TextStyle } from "react-native"

interface TextFieldProps extends TextInputProps {
  variant: TextFieldVariant
}

type TextFieldVariant = "primary" | "transparent"

const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ variant, style, ...rest }: TextFieldProps, ref) => {
    const variants: Record<TextFieldVariant, StyleProp<TextStyle>> = {
      primary: {
        backgroundColor: PlatformColor("secondarySystemBackground"),
        padding: 10,
        borderRadius: 8,
      },
      transparent: {
        backgroundColor: "transparent",
      },
    }

    return (
      <TextInput
        ref={ref}
        style={[
          { ...(variants[variant] as object), ...(style as object) },
          { color: PlatformColor("label") },
        ]}
        placeholderTextColor={PlatformColor("placeholderText")}
        {...rest}
      />
    )
  },
)

export { TextField }
