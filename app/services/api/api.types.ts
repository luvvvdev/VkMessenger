import { GeneralApiProblem } from "./api-problem"
import {
    BaseError,
    MessagesGetConversationsByIdExtendedResponse,
    MessagesGetConversationsResponse,
    MessagesGetHistoryExtendedResponse, MessagesGetLongPollHistoryResponse, MessagesSendResponse,
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

export type VkResponse<T> = {response?: T, error?: BaseError}

type ApiResult<T> = {kind: 'ok', data: VkResponse<T>}

type ApiRes<T> = ApiResult<T> | GeneralApiProblem

export type GetConversationsResult = ApiRes<MessagesGetConversationsResponse>
export type GetConversationsByIdResult = ApiRes<MessagesGetConversationsByIdExtendedResponse>
export type GetUserResult = ApiRes<UsersGetResponse>
export type GetHistoryResult = ApiRes<MessagesGetHistoryExtendedResponse>
export type PostMessageResult = ApiRes<MessagesSendResponse>
export type GetLongPollServerResult = ApiRes<MessagesGetLongPollServerResponse>
export type GetLongPollUpdatesResult = {kind: 'ok', data: MessagesLongPollUpdatesResponse}
export type GetLongPollHistoryResult = ApiRes<MessagesGetLongPollHistoryResponse>
// export type GetLongPollUpdatesResult = ApiRes<GroupsGet>
