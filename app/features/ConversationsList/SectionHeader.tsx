import {StyleSheet, Text, View} from "react-native";
import React from "react";

const SectionHeader = ({title}: {title: string}) => {

    return (
        <View style={styles.sectionHeaderContainer}>
            <Text style={styles.headerText}>{title}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    sectionHeaderContainer: {
        width: '100%', marginTop: 5, marginBottom: 10, alignItems: 'center'
    },
    headerText: {
        color: 'darkgray', fontSize: 12,
    }
})


export default SectionHeader
