import React from "react";
import * as UIKit from 'react-native-ios-kit'
import {useDispatch} from "react-redux";
import {Dispatch} from "../../../models";

export const UserSection = () => {
    const dispatch = useDispatch<Dispatch>()

    return (
        <UIKit.TableView>
            <UIKit.RowItem title={'Ночной режим'}/>
            <UIKit.NavigationRow title={'Онлайн'} info={'Все'}/>
            <UIKit.RowItem title={'Выход'} onPress={dispatch.user.logout}/>
        </UIKit.TableView>
    )
}
