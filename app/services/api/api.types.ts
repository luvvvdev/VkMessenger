import { GeneralApiProblem } from "./api-problem"
import {
    MessagesGetConversationsByIdExtendedResponse,
    MessagesGetConversationsResponse,
    MessagesGetHistoryExtendedResponse, MessagesSendResponse,
    UsersGetResponse
} from "../../types/vk";

type MessagesGetLongPollServerResponse = {
    key: string
    server: string
    ts: number
}

type MessagesLongPollUpdatesResponse = {
    ts: number,
    updates?: any[]
    failed?: number
}

type ApiResult<T> = {kind: 'ok', data: T}

type ApiRes<T> = ApiResult<T> | GeneralApiProblem

export type GetConversationsResult = ApiRes<MessagesGetConversationsResponse>
export type GetConversationsByIdResult = ApiRes<MessagesGetConversationsByIdExtendedResponse>
export type GetUserResult = ApiRes<UsersGetResponse>
export type GetHistoryResult = ApiRes<MessagesGetHistoryExtendedResponse>
export type PostMessageResult = ApiRes<MessagesSendResponse>
export type GetLongPollServerResult = ApiRes<MessagesGetLongPollServerResponse>
export type GetLongPollUpdatesResult = ApiRes<MessagesLongPollUpdatesResponse>
export type GetLongPollUpdatesResult = ApiRes<GroupsGet>
