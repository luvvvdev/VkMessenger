import {ApisauceInstance, create, ApiResponse} from "apisauce"
import { getGeneralApiProblem } from "./api-problem"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"
import {GetConversationsResult, GetUserResult} from "./api.types";
import VKLogin from "react-native-vkontakte-login";

/**
 * Manages all requests to the API.
 */
export class Api {
  /**
   * The underlying apisauce instance which performs the requests.
   */
  apisauce: ApisauceInstance

  /**
   * Configurable options.
   */
  config: ApiConfig

  /**
   * Creates the api.
   *
   * @param config The configuration to use.
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
  }

  /**
   * Sets up the API.  This will be called during the bootup
   * sequence and will happen before the first React component
   * is mounted.
   *
   * Be as quick as possible in here.
   */
  async setup() {
    let access_token: string | undefined = undefined;
    let v = '5.133';

    const data = await VKLogin.getAccessToken()

    if (data?.access_token) {
      access_token = data.access_token
    }

    // construct the apisauce instance
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
        'User-Agent': 'VKDesktopMessenger/5.3.2 (darwin; 20.4.0; x64)'
      },
      params: {
        access_token, v, lang: 'ru'
      }
    })

    global.api = this as Api
  }

  async getUser(): Promise<GetUserResult> {
    try {
      const response: ApiResponse<any, any> = await this.apisauce.get(`/method/users.get`, {
        fields: ['has_photo', 'photo_100', 'photo_200']
      })

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data.response } as GetUserResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }

  async getConversations(): Promise<GetConversationsResult> {
    try {
      const response: ApiResponse<any, any> = await this.apisauce.get(`/method/messages.getConversations`, {
        extended: true, offset: 0, count: 200
      })

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      // console.log(response)

      return { kind: "ok", data: response.data.response } as GetConversationsResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }


}
