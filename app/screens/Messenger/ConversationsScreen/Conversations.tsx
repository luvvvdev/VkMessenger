import React from "react";
import {StyleSheet, View,} from "react-native";
import {TextField} from "../../../components/TextField/TextField";
import {Lazy} from "../../../components/Lazy/Lazy";

import ConversationsList from '../../../features/ConversationsList'
import {translate} from "../../../i18n";

const Conversations = () => (
    <View>
        <ConversationsList />
    </View>
)

export default Conversations
