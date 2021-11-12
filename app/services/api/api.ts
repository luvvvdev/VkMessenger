import {ApisauceInstance, create, ApiResponse} from "apisauce"
import { getGeneralApiProblem } from "./api-problem"
import { ApiConfig, DEFAULT_API_CONFIG } from "./api-config"
import {
  GetConversationsByIdResult,
  GetConversationsResult, GetLongPollHistoryResult,
  GetLongPollServerResult,
  GetLongPollUpdatesResult,
  GetUserResult,
  PostMessageResult, VkResponse
} from "./api.types";
import VKLogin from "react-native-vkontakte-login";
import {
  MessagesGetByConversationMessageIdResponse,
  MessagesGetConversationsByIdExtendedResponse,
  MessagesGetHistoryParams, MessagesGetLongPollHistoryParams,
  MessagesSendResponse
} from "../../types/vk";
import axios from 'axios'
import rax from 'retry-axios'

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

    const axiosInstance = axios.create({
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

    axiosInstance.defaults.raxConfig = {
      instance: axiosInstance,
      // Retry 3 times on requests that return a response (500, etc) before giving up.  Defaults to 3.
      retry: 3,

      // Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
      noResponseRetries: 2,

      // Milliseconds to delay at first.  Defaults to 100. Only considered when backoffType is 'static'
      retryDelay: 1000,

      // HTTP methods to automatically retry.  Defaults to:
      // ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT']
      httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'],

      // The response status codes to retry.  Supports a double
      // array with a list of ranges.  Defaults to:
      // [[100, 199], [429, 429], [500, 599]]
      statusCodesToRetry: [[100, 199], [429, 429], [500, 599]],

      // You can set the backoff type.
      // options are 'exponential' (default), 'static' or 'linear'
      backoffType: 'exponential',

      // You can detect when a retry is happening, and figure out how many
      // retry attempts have been made
      onRetryAttempt: err => {
        const cfg = rax.getConfig(err);
        console.log(`Retry attempt #${cfg?.currentRetryAttempt}`);
      }
    };

    const raxn = rax.attach(axiosInstance)

    console.log('rax attached', raxn)

    // construct the apisauce instance
    this.apisauce = create({
      // @ts-ignore
      axiosInstance: axiosInstance
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

  async sendMessage(peer_id: number, message: string, random_id?: number): Promise<PostMessageResult> {
    try {
      const response: ApiResponse<VkResponse<MessagesSendResponse>, any> = await this.apisauce.post(`/method/messages.send`, {

      }, {params: { random_id: random_id || Number(new Date().getMilliseconds()), peer_id, message, }})

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
        need_pts: 1, lp_version: 5
      })

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      console.log('long poll server data', response.data)
      return { kind: "ok", data: response.data } as GetLongPollServerResult
    } catch (e) {
      return {kind: "bad-data"}
    }
  }

  async getLongPollUpdates(server: string, key: string, ts: number): Promise<GetLongPollUpdatesResult> {
      const response: ApiResponse<any, any> = await this.apisauce.get(`https://${server}`, {
        act: 'a_check', key, ts, wait: 60, mode: 2 | 8 | 32 | 64 | 128 | 512, version: 12
      }, {baseURL: undefined})

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem as any
      }

      return { kind: "ok", data: response.data } as GetLongPollUpdatesResult
  }

  async getLongPollHistory(params: MessagesGetLongPollHistoryParams): Promise<GetLongPollHistoryResult> {
    const response: ApiResponse<any, any> = await this.apisauce.get(`/method/messages.getLongPollHistory`,
        {
          ...params, lp_version: 12,
        })

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem as any
    }

    return { kind: "ok", data: response.data } as GetLongPollHistoryResult
  }

  async getMessageByConversationId(peer_id: number, conversation_id: number) {
    try {
      const response: ApiResponse<VkResponse<MessagesGetByConversationMessageIdResponse>, any> = await this.apisauce.get(`/method/messages.getByConversationMessageId`, {
        extended: true, conversation_message_ids: [conversation_id], peer_id
      })

      // the typical ways to die when calling an api
      if (!response.ok || response.data?.error) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      return {kind: "bad-data"}
    }
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

  async searchConversations(): Promise<GetConversationsResult> {
    try {
      const response: ApiResponse<any, any> = await this.apisauce.get(`/method/messages.searchConversations`, {
        extended: true, offset: 0, count: 20
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
