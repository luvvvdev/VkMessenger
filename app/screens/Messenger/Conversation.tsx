import {SafeAreaView, Text, View} from "react-native";
import React from "react";

const ConversationScreen = (props) => {
    console.log(props)

    return <SafeAreaView>
        <View style={{paddingRight: 20, paddingLeft: 20}}>
            <View style={{height: '100%'}}>
                <Text>messagesPlace</Text>
            </View>
            <View style={{height: 80}}>

            </View>
        </View>
    </SafeAreaView>
}

export default ConversationScreen
