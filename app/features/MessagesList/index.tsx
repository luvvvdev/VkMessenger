import {ActivityIndicator, Dimensions, ListRenderItemInfo, SectionList, StyleSheet, Text, View} from "react-native";
import React, {useEffect} from "react";
import {MessagesMessage} from "../../types/vk";
import MessageItem from "../../components/MessageItem";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../models";
import {navigate} from "../../navigators";
import * as _ from 'lodash'
import startOfDay from 'date-fns/startOfDay'
import {format, formatDistanceToNowStrict, isSameYear, isToday} from "date-fns";
import BigList, {BigListItem} from 'react-native-big-list'
import SectionHeader from "../ConversationsList/SectionHeader";
import {LargeList} from 'react-native-largelist'

type MessagesProps = {
    peer_id: number
}

const getDate = (utcString: string) => {
    const messageDate = Date.parse(utcString)

    if (isToday(messageDate)) return 'Сегодня' // formatDistanceToNowStrict(messageDate)
    if (isSameYear(messageDate, new Date())) return format(messageDate, 'd MMMM')

    return format(messageDate, 'dd.MM.yyyy')
}

const getStartOfDayUTC = (item) => startOfDay(item.date * 1000).toUTCString()

export default ({peer_id}: MessagesProps) => {
    const dispatch = useDispatch<Dispatch>()

    const myId = useSelector((state: RootState) => state.user.user_data?.id)
    const historyLoading = useSelector((state: RootState) => state.loading.effects.history.get.loading)

    const messages = useSelector<RootState, Array<{items: MessagesMessage[]}>>((state) => {
        const messages = state.history.items[peer_id]?.items

        const _partitionedMessages: {[key: string]: MessagesMessage[]} = _.groupBy<MessagesMessage[], string>(messages, (item) => startOfDay(item.date * 1000).toUTCString())

        const sectionedMessages: Array<{items: MessagesMessage[]}> = []

        Object.keys(_partitionedMessages).forEach((key) => {
            sectionedMessages.push({items: _partitionedMessages[key]})
        })

        return sectionedMessages
    })

    const {profiles, groups} = useSelector((state: RootState) => ({profiles: state.conversations.profiles, groups: state.conversations.groups}))

    useEffect(() => {
        dispatch.history.get({peer_id, offset: 0, count: 200})
            .catch((error) => {
                console.log('error')
                dispatch.history.clear({peer_id})
                navigate('messenger')
            })
    }, [])

    const renderItem = (data: MessagesMessage) => (
            <MessageItem message={data} myId={myId || 0} extraData={{profiles: profiles || [], groups: groups || []}} style={{marginBottom: 10}}/>
    )

    const keyExtractor = (item: MessagesMessage) => (`message-${item.from_id}-${item.id}`)

    const onEndReached = ({distanceFromEnd}) => {
        if (distanceFromEnd < 0) return

        console.log('loading more messages', distanceFromEnd)

        dispatch.history.loadMore({count: 200})
            .catch((e) => {
                console.log('loading more error', e)
            })
    }

    const renderSectionHeader = (section) => (
        <SectionHeader title={getDate(getStartOfDayUTC(messages![section].items[0]))} />
    )

    const getHeightForItem = ({section, row}) => {
        const msg = messages[section].items[row]

        const baseContainerHeight = 55
        const rowMaxSymbolsCount = 37
        const heightOfRow = 20 // height for one row

        const heightOfRows = msg.text.length / rowMaxSymbolsCount * heightOfRow

        // fixed height/width for attachment
        const imageHeight = 200

        const hasImage = msg.attachments && msg.attachments.length > 0 && msg.attachments[0].type === 'photo'

        return baseContainerHeight + heightOfRows + (hasImage ? imageHeight : 0)
    }

    return (
        <View>
            {
                !historyLoading && messages ? (
                    <LargeList
                        inverted
                        data={messages}
                        style={styles.messagesList}
                        renderSection={renderSectionHeader}
                        heightForIndexPath={getHeightForItem}
                        renderIndexPath={indexPath => renderItem(messages[indexPath.section].items[indexPath.row])}
                        // extraData={[groups, profiles, messages]}
                        // inverted={true}
                        // removeClippedSubviews={true}
                        // persistentScrollbar={true}
                        // initialNumToRender={20}
                        // maxToRenderPerBatch={50}
                        // onEndReachedThreshold={0.5}
                        // onEndReached={onEndReached}
                        // renderItem={renderItem}
                        // keyExtractor={keyExtractor}
                        // contentInsetAdjustmentBehavior={'never'}
                        // automaticallyAdjustContentInsets={false}
                        // style={styles.messagesList}
                        // renderSectionFooter={renderSectionHeader}
                        // sections={messages}
                        // sectionFooterHeight={40}
                        // itemHeight={40}
                    />
                ) : (
                    <View style={styles.messagesListLoadingContainer}>
                        <ActivityIndicator />
                    </View>
                )
            }
        </View>
            )
}

const styles = StyleSheet.create({
    messagesList: {
       height: '94.8%',
        width: '100%'
    },
    messagesListLoadingContainer: {
        height: '97%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }
})
