import FastImage, {ImageStyle, Source} from "react-native-fast-image";
import React, {memo, useRef} from "react";
import {PlatformColor, StyleSheet, Text, View} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import _ from 'lodash'

type AvatarProps = {
    url?: string
    size: number
    style?: ImageStyle
}

const gradients = [
    ['#ff6952', '#e6404b'],
    ['#ffb829', '#fa7f14'],
    ['#ffdc50', '#f2b40b'],
    ['#78e070', '#46b864'],
    ['#78f1fa', '#46bddb'],
    ['#e664fa', '#a73ddb'],
    ['#66ccff', '#3f8ae0'],
    ['#bac2cc', '#8c97a3']
]

const emojis = [`🚀`, `🦄`, `🏳‍🌈`, `🍔`, `🍩`, `🍭`, `🍿`, `🍫`, `💰`, `💊`, `🎈`, `🌈`]

export const Avatar = memo(({url, size, style}: AvatarProps) => {
    const colors = useRef(_.sample(gradients)).current
    const emoji = useRef(_.sample(emojis)).current

    const source: Source = {
        uri: url,
        priority: FastImage.priority.high,
        cache: 'cacheOnly'
    }

    const calculatedStyles = {height: size, width: size, ...style}

    if (!url) return (
        <View
            style={{...styles.avatar, ...styles.initialAvatar, ...calculatedStyles}}
        >
            <LinearGradient colors={colors} style={{width: '100%', height: '100%', ...styles.initialAvatar}}>
                <Text style={{textAlign: 'center', fontSize: 20}}>{emoji}</Text>
            </LinearGradient>
        </View>
    )

    return (
        <FastImage
            source={source}
            // @ts-ignore
            style={[styles.avatar, style, calculatedStyles]}
        />
    )
})

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: PlatformColor('secondarySystemBackground'),
        borderRadius: 666,
        overflow: 'hidden'
    },
    initialAvatar: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})
