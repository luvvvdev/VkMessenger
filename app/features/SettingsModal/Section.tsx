import { SectionRow } from "./types"
import { List, Row } from "react-native-ios-list"
import { PlatformColor, StyleSheet, Text, View } from "react-native"
import React from "react"

type SectionProps = {
  header?: string
  rows: SectionRow[]
}

export const Section = ({ header, rows }: SectionProps) => (
  <List header={header} sideBar={false} inset={true}>
    {rows.map((row, i) => {
      const leading = (
        <View
          style={{
            height: 28,
            width: 28,
            padding: 5,
            borderRadius: 20,
            backgroundColor: row.leading?.color || "gray",
          }}
        >
          {row.leading?.icon}
        </View>
      )

      return (
        <Row
          style={styles.row}
          onPress={row.onPress}
          key={i}
          leading={row.leading ? leading : undefined}
        >
          <Text style={styles.text}>{row.title}</Text>
        </Row>
      )
    })}
  </List>
)

const styles = StyleSheet.create({
  row: {
    backgroundColor: PlatformColor("secondarySystemBackground"),
    borderColor: PlatformColor("separator"),
  },
  text: {
    color: PlatformColor("label"),
  },
})
