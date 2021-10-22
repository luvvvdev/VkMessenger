import React from "react";
import Screen from "../../../components/Screen";

const Conversations = React.lazy(() => import('./Conversations'))

const ConversationsScreen = (props) => (
    <Screen>
        <Conversations {...props}/>
    </Screen>
)

export default ConversationsScreen
