import {createModel} from "@rematch/core";
import VKLogin, {VKLoginResult} from "react-native-vkontakte-login";
import {UsersUserFull} from "../../types/vk";
import {RootModel} from "../index";
import {GetUserResult} from "../../services/api";

interface State {
    login_data: VKLoginResult | null
    user_data: UsersUserFull | null
}

export const user = createModel<RootModel>()({
    state: {
        login_data: null,
        user_data: null
    } as State,
    reducers: {
        update: (state, {user_data, login_data}) => ({user_data, login_data}),
    },
    effects: dispatch => ({
        login: async () => {
            let login_data: VKLoginResult | null = null;
            let user_data: UsersUserFull | null = null;

            try {
                login_data = await VKLogin.login(['notify', 'friends', 'photos', 'audio', 'video', 'stories', 'pages', 'status', 'notes', 'messages', 'wall', 'offline', 'docs', 'groups', 'notifications', 'email', 'market'])

                const user_request = await global.api.getUser() as GetUserResult

                if (user_request.kind === 'ok') {
                    user_data = user_request.data[0]
                }

                console.log('userData', user_data)
            } catch (e) {
                console.log(e)
            }

            // @ts-ignore
            dispatch.user.update({login_data, user_data})
        },
        logout: async () => {
            await VKLogin.logout()
            // @ts-ignore
            dispatch.user.update({user_data: null, login_data: null})
        }
    })

})
