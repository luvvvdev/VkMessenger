import React, {memo, useLayoutEffect, useState} from "react";
import {PlatformColor, Text, TextStyle} from "react-native";
import {differenceInMinutes, format, formatDistanceToNowStrict, isSameYear, isToday} from "date-fns";
import {MessagesMessage} from "../../types/vk";

const getDate = (last_message) => {
    const messageDate = last_message.date * 1000

    if (differenceInMinutes(Date.now(), messageDate) <= 1) return 'Сейчас'
    if (isToday(messageDate)) return formatDistanceToNowStrict(messageDate)
    if (isSameYear(messageDate, new Date())) return format(messageDate, 'd MMM')

    return format(messageDate, 'dd.MM.yyyy')
}

export const TimeAgo = ({last_message}: TimeAgoProps) => {
    /* const [time, setTime] = useState(getDate(last_message))

    useLayoutEffect(() => {
        const int = setInterval(() => {
            setTime(getDate(last_message))
        }, 60000)

        return () => {
            clearInterval(int)
        }
    }, []) */

    return <Text style={{color: PlatformColor('secondaryLabel')}}>{' '}· {getDate(last_message)}</Text>
}

export type TimeAgoProps = {
    last_message: MessagesMessage
}
