import { createModel } from "@rematch/core"
import VKLogin, { VKLoginResult } from "react-native-vkontakte-login"
import { UsersUserFull } from "../../types/vk"
import { RootModel } from "../index"
import { GetUserResult } from "../../services/api"

interface State {
  login_data: VKLoginResult | null
  user_data: UsersUserFull | null
}

export const user = createModel<RootModel>()({
  state: {
    login_data: null,
    user_data: null,
  } as State,
  reducers: {
    update: (state, { user_data, login_data }) => ({ user_data, login_data }),
  },
  effects: (dispatch) => ({
    login: async () => {
      let login_data: VKLoginResult | null = null
      let user_data: UsersUserFull | null = null

      try {
        login_data = await VKLogin.login([
          "notify",
          "friends",
          "photos",
          "audio",
          "video",
          "stories",
          "pages",
          "status",
          "notes",
          "messages",
          "wall",
          "offline",
          "docs",
          "groups",
          "notifications",
          "email",
          "market",
        ])

        const response = (await global.api.getUser()) as GetUserResult

        if (response.kind === "ok" && response.data) {
          const userData = (response.data.response || [null])[0]

          if (!userData) return

          user_data = userData
        }
      } catch (e) {
        console.log(e)

        return
      }

      // @ts-ignore
      dispatch.user.update({ login_data, user_data })
    },
    logout: async () => {
      await VKLogin.logout()

      dispatch.history.reset()
      ;(dispatch.conversations.reset as () => void)()
      ;(dispatch.user.update as any)({ user_data: null, login_data: null })
    },
  }),
})
