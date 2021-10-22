import React, {forwardRef} from "react";
import * as Modal from 'react-native-ios-modal/lib/commonjs'
import {
    ScrollView, StyleSheet,
    Text,
    View
} from "react-native";
import FastImage from 'react-native-fast-image'
import {useSelector} from "react-redux";
import {RootState} from "../../models";
import {UserSection} from "./sections/UserSection";
import {DeveloperSection} from "./sections/DeveloperSection";

// console.log(Object.keys(UIKit))

const SettingsModal = forwardRef((props, ref) => {
    const userData = useSelector((state: RootState) => state.user.user_data)

    const imgSource = {
        method: 'GET',
        uri: userData?.photo_100,
    }

    return (
        <Modal.ModalView ref={ref} isModalBGBlurred={false} isModalBGTransparent={false}>
            <>
                <ScrollView>
                    <View style={styles.userViewContainer}>
                        <FastImage style={styles.userAvatar} source={imgSource} />
                        <Text style={styles.userName}>{`${userData?.first_name} ${userData?.last_name}`}</Text>
                    </View>
                    <View>
                        <UserSection />
                        <DeveloperSection />
                    </View>
                </ScrollView>
            </>
        </Modal.ModalView>
    )
})

const styles = StyleSheet.create({
    userViewContainer: {
        paddingTop: 20,
        marginBottom: 15,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    userAvatar: {
        height: 80,
        width: 80,
        backgroundColor: 'gray',
        borderRadius: 999,
        marginBottom: 10
    },
    userName: {fontSize: 20, fontWeight: '600'}
})

export default SettingsModal
