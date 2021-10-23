import {ActivityIndicator, Animated, StyleSheet, View} from "react-native";
import React, {useEffect, useRef} from "react";
import {MessagesMessage} from "../../types/vk";
import MessageItem from "../../components/MessageItem";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../models";
import {navigate} from "../../navigators";
import * as _ from 'lodash'
import startOfDay from 'date-fns/startOfDay'
import {format, isSameYear, isToday} from "date-fns";
import BigList from 'react-native-big-list'
import SectionHeader from "../ConversationsList/SectionHeader";
import {getAttachmentsHeight} from "../../utils/getAttachmentsHeight";

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
    const loadingMore = useSelector((state: RootState) => state.loading.effects.history.loadMore.loading)

    const messages = useSelector<RootState, Array<MessagesMessage[]>>((state) => {
        const messages = state.history.items[peer_id]?.items

        const groupedMessages: {[key: string]: MessagesMessage[]} = _.groupBy<MessagesMessage[], string>(messages, (item) => startOfDay(item.date * 1000).toUTCString())

        const sectionedMessages: Array<MessagesMessage[]> = []

        Object.keys(groupedMessages).forEach((key, index) => {
            sectionedMessages.push(groupedMessages[key])
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
                <MessageItem
                    message={data} myId={myId || 0}
                    extraData={{profiles: profiles || [], groups: groups || []}}
                    style={{marginBottom: 10}} />
    )

    const keyExtractor = (item: MessagesMessage) => (`message-${item.from_id}-${item.id}`)

    const onEndReached = ({distanceFromEnd}) => {
        if (distanceFromEnd < 0) return

        dispatch.history.loadMore({count: 200})
            .catch((e) => {
                console.log('loading more error', e)
            })
    }

    const renderSectionHeader = (section) => (
        <SectionHeader title={getDate(getStartOfDayUTC(messages![section][0]))} />
    )

    const getHeightForItem = (section: number, item: number) => {
        if (!Number.isInteger(item) || !Number.isInteger(section)) return 60

        const msg = messages[section][item]

        const baseContainerHeight = 60
        const rowMaxSymbolsCount = 37
        const heightOfRow = 20 // height for one row

        const heightOfRows = msg.text.length > 0 ? msg.text.length / rowMaxSymbolsCount * heightOfRow : 0

        const attachmentsHeight = getAttachmentsHeight(msg.attachments)

        const height = baseContainerHeight + heightOfRows + attachmentsHeight

        return height
    }

    const placeholder = (
        <View style={styles.messagesListLoadingContainer}>
            <ActivityIndicator />
        </View>
    )

    if (historyLoading && !loadingMore) return placeholder

    return (
            <View style={styles.messagesList}>
                <BigList
                    inverted={true}
                    sections={messages}
                    // @ts-ignore
                    itemHeight={getHeightForItem}
                    renderItem={(item) => renderItem(item.item)}
                    renderSectionHeader={renderSectionHeader}
                    //stickySectionHeadersEnabled={true}
                    invertStickyHeaders={true}
                    sectionHeaderHeight={30}
                    placeholderComponent={placeholder}
                    contentContainerStyle={{paddingLeft: 20, paddingRight: 20}}
                    keyExtractor={keyExtractor}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}

                    removeClippedSubviews={true}
                    batchSizeThreshold={0.5}
                    footerHeight={50}

                    renderFooter={loadingMore ? () => <ActivityIndicator /> : undefined}
                />
            </View>
    )
}

const styles = StyleSheet.create({
    messagesList: {
       height: '94%',
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
