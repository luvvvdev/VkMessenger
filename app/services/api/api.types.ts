import { GeneralApiProblem } from "./api-problem"
import {MessagesGetConversationsResponse, UsersGetResponse} from "../../types/vk";

type ApiResult<T> = {kind: 'ok', data: T}

type ApiRes<T> = ApiResult<T> | GeneralApiProblem

export type GetConversationsResult = ApiRes<MessagesGetConversationsResponse>
export type GetUserResult = ApiRes<UsersGetResponse>
