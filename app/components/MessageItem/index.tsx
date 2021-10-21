import {Text, View, ViewStyle} from "react-native";
import React, {useEffect, useState} from "react";
import {GroupsGroupFull, UsersUserFull} from "../../types/vk";
import {format} from "date-fns";
import FastImage from "react-native-fast-image"
import {Message} from "../../entities/Message";

type MessageItemProps = {
    message: Message
    style?: ViewStyle
    extraData: {
        profiles: UsersUserFull[]
        groups: GroupsGroupFull[]
    },
    myId: number
}

const MessageItem = ({message, style, extraData: {profiles, groups}, myId}: MessageItemProps) => {
    const [peer, setPeer] = useState<UsersUserFull | GroupsGroupFull | null>(null)

    const isMine = message.from_id === myId

    const getPeerById = (id: number) => {
        if (profiles && groups) return id > 0 ? profiles.find((profile) => profile.id === id) || null : groups.find((group => group.id === id)) || null;

        return null
    }

    useEffect(() => {
        const _peer = getPeerById(message.from_id)

        setPeer(_peer)

    }, [profiles, groups])

    return (
        <View key={`${peer}`} style={{display: 'flex', flexDirection: !isMine ? 'row' : 'row-reverse', maxWidth: '90%',  alignItems: 'flex-end', ...style}}>
            {
                !isMine && (<FastImage source={{uri: peer?.photo_100, priority: FastImage.priority.high,}} style={{height: 25, width: 25, backgroundColor: 'gray', borderRadius: 666, marginRight: 5}}/>)
            }
            <View style={{padding: 10, flexWrap: 'wrap',backgroundColor: 'whitesmoke', borderRadius: 8}}>
                <View style={{minWidth: 0}}>
                    <View style={{margin: 0}}>
                        <Text style={{flexWrap: 'wrap'}} textBreakStrategy={'simple'}>{message.text}</Text>
                        <View style={{ position: 'relative', top: 5, marginLeft: 30, alignSelf: 'flex-end'}}>
                            <Text style={{fontSize: 11, color: 'gray'}}>{format(message.date * 1000, 'hh:mm')}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export {MessageItem}
