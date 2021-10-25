import {SectionRow} from "./types";
import {List, Row} from "react-native-ios-list";
import {PlatformColor, StyleSheet, Text} from "react-native";
import React from "react";

type SectionProps = {
    header?: string
    rows: SectionRow[]
}

export const Section = ({header, rows}: SectionProps) => (
    <List header={header} sideBar={false} inset={true}>
        {
            rows.map((row, i) => (
                <Row style={styles.row} onPress={row.onPress} key={i}>
                    <Text style={styles.text}>{row.title}</Text>
                </Row>
            ))
        }
    </List>
)

const styles = StyleSheet.create({
    row: {
        backgroundColor: PlatformColor('secondarySystemBackground'),
        borderColor: PlatformColor('separator')
    },
    text: {
        color: PlatformColor('label')
    }
})
