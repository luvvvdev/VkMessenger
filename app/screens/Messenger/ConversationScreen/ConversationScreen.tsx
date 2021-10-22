import React from "react";
import Screen from "../../../components/Screen";
import Conversation from './Conversation'
import {View} from "react-native";
// const Conversation = React.lazy(() => import('./Conversation'))

export default (props) => (
    <View>
        <Conversation {...props}/>
    </View>
)
