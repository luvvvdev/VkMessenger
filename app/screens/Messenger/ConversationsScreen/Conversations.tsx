import React from "react";
import {StyleSheet, View,} from "react-native";
import {TextField} from "../../../components/TextField/TextField";
import {Lazy} from "../../../components/Lazy/Lazy";

import ConversationsList from '../../../features/ConversationsList'

const Conversations = () => (
    <View>
        <TextField style={{marginBottom: 20, marginTop: 5}} variant={'primary'} placeholder={'Поиск'}/>
        <Lazy>
            <ConversationsList />
        </Lazy>
    </View>
)

export default Conversations
