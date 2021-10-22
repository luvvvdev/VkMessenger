import React from "react";
import * as UIKit from 'react-native-ios-kit'

export const UserSection = () => (
    <UIKit.TableView>
        <UIKit.RowItem title={'Ночной режим'}/>
        <UIKit.NavigationRow title={'Онлайн'} info={'Все'}/>
    </UIKit.TableView>
)
