import { PlatformColor, StyleSheet, Text, View } from "react-native"
import React from "react"

type EmbedMessageProps = {
  author: string
  text: string
  textColor: any
}

export const EmbedMessage = ({ author, text, textColor }: EmbedMessageProps) => {
  return (
    <View style={[styles.embedMessage]}>
      <View style={styles.embedMessageTextContainer}>
        <Text
          numberOfLines={1}
          lineBreakMode={"tail"}
          style={[styles.embedMessageTextContent, { color: textColor, marginBottom: 0 }]}
        >
          {text}
        </Text>
        <Text style={[styles.embedMessageTextContent, styles.authorNameText, { color: textColor }]}>
          {author}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  embedMessage: {
    display: "flex",
    paddingLeft: 7,
    paddingRight: 4,
    paddingVertical: 2,
    marginBottom: 5,
    marginHorizontal: -2,
    position: "relative",
    overflow: "hidden",
    borderLeftWidth: 2,
    borderLeftColor: PlatformColor("opaqueSeparator"),
  },
  embedMessageTextContainer: {
    overflow: "hidden",
    marginInlineStart: 0,
    display: "flex",
    flexDirection: "column-reverse",
  },
  embedMessageTextContent: {
    //whiteSpace: "nowrap",
    overflow: "hidden",
    fontSize: 13,
    marginBottom: 3,
    // flex: 1
  },
  authorNameText: {
    fontWeight: "600",
  },
})
