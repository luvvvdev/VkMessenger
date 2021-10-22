import {ApisauceInstance, create, ApiResponse} from "apisauce"
import { getGeneralApiProblem } from "./api-problem"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"
import {
  GetConversationsByIdResult,
  GetConversationsResult,
  GetLongPollServerResult,
  GetLongPollUpdatesResult,
  GetUserResult,
  PostMessageResult, VkResponse
} from "./api.types";
import VKLogin from "react-native-vkontakte-login";
import {
  MessagesGetConversationsByIdExtendedResponse,
  MessagesGetHistoryParams,
  MessagesSendResponse
} from "../../types/vk";

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
        //'User-Agent': 'VKDesktopMessenger/5.3.2 (darwin; 20.4.0; x64)'
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

      return { kind: "ok", data: response.data } as GetUserResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }

  async getHistory(peer_id: number, offset?: number, count?: number, start_message_id?: number): Promise<GetConversationsResult> {
    try {
      const response: ApiResponse<any, any> = await this.apisauce.get(`/method/messages.getHistory`, {
        extended: true, peer_id, count: count || 200, offset: offset || 0, rev: 0, start_message_id
      } as MessagesGetHistoryParams)

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data } as GetConversationsResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }

  async findConversations(query: string): Promise<GetConversationsResult> {
    try {
      const response: ApiResponse<any, any> = await this.apisauce.get(`/method/messages.getConversations`, {
        extended: true, q: query
      })

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data } as GetConversationsResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }

  async sendMessage(peer_id: number, message: string): Promise<PostMessageResult> {
    try {
      const response: ApiResponse<VkResponse<MessagesSendResponse>, any> = await this.apisauce.post(`/method/messages.send`, {

      }, {params: { random_id: Number(new Date().getMilliseconds()), peer_id, message, }})

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data } as PostMessageResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }

  async getLongPollServer(): Promise<GetLongPollServerResult> {
    try {
      const response: ApiResponse<any, any> = await this.apisauce.get(`/method/messages.getLongPollServer`, {
        need_pts: 1, lp_version: 3
      })

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data } as GetLongPollServerResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }

  async getLongPollUpdates(server: string, key: string, ts: number): Promise<GetLongPollUpdatesResult> {
      const response: ApiResponse<any, any> = await this.apisauce.get(`https://${server}`, {
        act: 'a_check', key, ts, wait: 60, mode: 234, version: 12
      }, {baseURL: undefined})

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem as any
      }

      return { kind: "ok", data: response.data } as GetLongPollUpdatesResult
  }

  async getConversationsById(peer_ids: number[]): Promise<GetConversationsByIdResult> {
    try {
      const response: ApiResponse<VkResponse<MessagesGetConversationsByIdExtendedResponse>, any> = await this.apisauce.get(`/method/messages.getConversationsById`, {
        extended: true, peer_ids: peer_ids
      })

      // the typical ways to die when calling an api
      if (!response.ok || response.data?.error) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      console.log('GET CONVERSATIONB', response.data)

      return { kind: "ok", data: response.data } as GetConversationsByIdResult
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

      //console.log(response.data)

      return { kind: "ok", data: response.data } as GetConversationsResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }


}
