import React from "react";
import Screen from "../../../components/Screen";

const Conversation = React.lazy(() => import('./Conversation'))

export default (props) => (
    <Screen>
        <Conversation {...props}/>
    </Screen>
)
