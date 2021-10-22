import {ActivityIndicator, ListRenderItemInfo, SectionList, StyleSheet, Text, View} from "react-native";
import React, {useEffect} from "react";
import {MessagesMessage} from "../../types/vk";
import MessageItem from "../../components/MessageItem";
import {useDispatch, useSelector} from "react-redux";
import {Dispatch, RootState} from "../../models";
import {navigate} from "../../navigators";
import _ from 'lodash'
import startOfDay from 'date-fns/startOfDay'
import {format, formatDistanceToNowStrict, isSameYear, isToday} from "date-fns";

type MessagesProps = {
    peer_id: number
}

const getDate = (utcString: string) => {
    const messageDate = Date.parse(utcString)

    if (isToday(messageDate)) return formatDistanceToNowStrict(messageDate)
    if (isSameYear(messageDate, new Date())) return format(messageDate, 'd MMMM')

    return format(messageDate, 'dd.MM.yyyy')
}

export default ({peer_id}: MessagesProps) => {
    const dispatch = useDispatch<Dispatch>()

    const myId = useSelector((state: RootState) => state.user.user_data?.id)
    const historyLoading = useSelector((state: RootState) => state.loading.effects.history.get.loading)
    const messages = useSelector<RootState, Array<{title: string, data: MessagesMessage[]}> | null>((state) => {
        const messages = state.history.items[peer_id]?.items

        if (!messages) return null

        // const dubplicated = _.filter(messages, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
        // console.log(dubplicated)

        const _partitionedMessages: {[key: string]: MessagesMessage[]} = _.groupBy<MessagesMessage[], string>(messages, (item) => startOfDay(item.date * 1000).toUTCString())

        const sectionedMessages: Array<{title: string, data: MessagesMessage[]}> = []

        Object.keys(_partitionedMessages).forEach((key) => {
            sectionedMessages.push({title: key, data: _partitionedMessages[key]})
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

    const renderItem = (data: ListRenderItemInfo<MessagesMessage>) => (
        <MessageItem message={data.item} myId={myId || 0} extraData={{profiles: profiles || [], groups: groups || []}} style={{marginBottom: 10}}/>
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

    const renderHeader = ({section}) => (
        <View style={styles.sectionHeaderContainer}>
            <Text style={styles.headerText}>{getDate(section.title)}</Text>
        </View>
    )

    return (
        <View>
            {
                !historyLoading && messages ? (
                    <SectionList
                        extraData={[groups, profiles, messages]}
                        inverted={true}
                        removeClippedSubviews={true}
                        persistentScrollbar={true}
                        initialNumToRender={20}
                        maxToRenderPerBatch={50}
                        onEndReachedThreshold={0.5}
                        onEndReached={onEndReached}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentInsetAdjustmentBehavior={'never'}
                        automaticallyAdjustContentInsets={false}
                        style={styles.messagesList}
                        renderSectionFooter={renderHeader}
                        sections={messages || []}
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
    sectionHeaderContainer: {
        width: '100%', marginTop: 5, marginBottom: 10, alignItems: 'center'
    },
    headerText: {
        color: 'darkgray', fontSize: 12,
    },
    messagesList: {height: '97%', width: '100%'},
    messagesListLoadingContainer: {height: '97%', width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}
})
