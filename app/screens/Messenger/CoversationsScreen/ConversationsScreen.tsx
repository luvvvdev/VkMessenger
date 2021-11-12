import React, { useEffect } from "react"
import { startLongPoll, stopLongPoll } from "../../../services/LongPoll/background"
import { useSelector } from "react-redux"
import { RootState } from "../../../models"
import BackgroundService from "react-native-background-actions"
import VK from "react-native-vkontakte-login"
import ConversationsList from "../../../features/ConversationsList"

const subscribeUpdates = async () => {
  if (global.lp_started || BackgroundService.isRunning() || !(await VK.isLoggedIn())) return

  await startLongPoll()
}

const ConversationsScreen = (props) => {
  const isLoggedIn = useSelector<RootState>((state) => Boolean(state.user.login_data?.access_token))

  useEffect(() => {
    if (isLoggedIn) {
      console.log("subscribe updates")
      subscribeUpdates()
    }

    return () => {
      stopLongPoll()
    }
  }, [])

  return <ConversationsList />
}

export default ConversationsScreen
