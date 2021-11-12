import React from "react"
import { Alert, Button, SafeAreaView, View } from "react-native"
import { navigate } from "../../navigators"
import { useDispatch, useSelector } from "react-redux"
import { Dispatch, RootState } from "../../models"

const LoginScreen = () => {
  const isLoggedIn = useSelector((state: RootState) => Boolean(state.user.login_data?.access_token))
  const { user } = useDispatch<Dispatch>()

  const login = async () => {
    if (isLoggedIn) {
      Alert.alert("Ошибка входа", "Вы уже авторизованы", [
        {
          text: "Ок",
          onPress: () => {
            navigate("messenger")
          },
        },
      ])

      return
    }

    user.login().catch((error) => {
      Alert.alert("Ошибка входа", error)
    })

    //console.log('AuthData', store.authData, store.isLoggedIn)
  }

  return (
    <SafeAreaView>
      <View style={{ paddingRight: 20, paddingLeft: 20 }}>
        {
          // <TextField variant={'primary'} placeholder={'Токен'} autoCapitalize={'none'} autoCorrect={false} importantForAutofill={'no'} value={token} onChangeText={(s) => setToken(s)}/>
        }
        <Button title={"Войти в аккаунт"} onPress={login} />
        {false ? <Button title={"Выйти"} onPress={user.logout} /> : null}
      </View>
    </SafeAreaView>
  )
}

const mapDispatch = (dispatch: Dispatch) => ({
  login: () => dispatch.user.login(),
})

export default LoginScreen //connect(null, mapDispatch)(LoginScreen)
