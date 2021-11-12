import { ConversationItem } from "../../components/ConversationItem/ConversationItem"
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from "react-native"
import React, { useEffect, useLayoutEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Dispatch, RootState } from "../../models"
import { ConversationsState } from "../../models/conversations"
import FastImage from "react-native-fast-image"
import BigList, { BigListRenderItemInfo } from "react-native-big-list"
import { MessagesConversationWithMessage } from "../../types/vk"
import _ from "lodash"
import { TextField } from "../../components/TextField/TextField"
import { translate } from "../../i18n"

const ListHeader = () => (
  <View style={{ marginHorizontal: 15, marginBottom: 15 }}>
    <TextField variant={"primary"} placeholder={`${translate("common.search")}`} />
  </View>
)

const ConversationsList = () => {
  const dispatch = useDispatch<Dispatch>()

  const { profiles, groups } = useSelector<RootState, ConversationsState>(
    (state) => state.conversations,
  )
  const conversations = useSelector<RootState, MessagesConversationWithMessage[]>(
    (state) => state.conversations.items,
  )
  const loading = useSelector<RootState, boolean>(
    (state) => state.loading.effects.conversations.get.loading!,
  )

  const getConversations = () =>
    dispatch.conversations.get().then(() => {
      if (profiles && groups) {
        const profilesPhotos = _.compact(profiles?.map((profile) => ({ uri: profile.photo_100 })))
        const groupsPhotos = _.compact(groups?.map((group) => ({ uri: group.photo_100 })))

        FastImage.preload([...profilesPhotos, ...groupsPhotos])
      }
    })

  useEffect(() => {
    if (conversations.length === 0) {
      getConversations()
    }
  }, [])

  const renderItem = (data: BigListRenderItemInfo<MessagesConversationWithMessage>) => {
    const item = data.item

    if (!item.conversation) {
      console.log("error VALUE", item.conversation)
      // dispatch.conversations.removeConversation({peer_id: value.last_message.peer_id})
      return null
    }

    return <ConversationItem data={item} key={`conversation-${item.conversation.peer.id}-index`} />
  }

  return (
    <SafeAreaView>
      <View style={{ width: "100%", paddingTop: 50, height: "100%" }}>
        {!loading ? (
          <BigList
            renderHeader={() => <ListHeader />}
            headerHeight={55}
            showsHorizontalScrollIndicator={false}
            itemHeight={65}
            removeClippedSubviews={true}
            data={conversations}
            renderItem={renderItem}
          />
        ) : (
          <View>
            <ActivityIndicator />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default ConversationsList
