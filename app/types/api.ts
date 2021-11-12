type IPeerID = number

type IPeer = {
  id: IPeerID
  type: string
  local_id: number
}

type IPushSettings = {
  disabled_until: number
  disabled_forever: boolean
  no_sound: boolean
}

type ChatSettingsState = "in" | "kicked" | "left"

type UnixDate = number

type IMessageID = number

type IGeo = {
  type: string
  coordinates: {
    latitude: number
    longitude: number
  }
  place: {
    id: number
    title: string
    latitude: string
    longitude: string
    created: number | null
    icon: string
    country: string
    city: string
  }
  showmap: number
}

// TODO: finish it
type IAttachment = {}

type IConversationActionType =
  | "chat_photo_update"
  | "chat_photo_remove"
  | "chat_create"
  | "chat_title_update"
  | "chat_invite_user"
  | "chat_kick_user"
  | "chat_pin_message"
  | "chat_unpin_message"
  | "chat_invite_user_by_link"

type IConversationPhoto = {
  photo_50: string
  photo_100: string
  photo_200: string
}

type IMessage = {
  id: number
  date: UnixDate
  peer_id: IPeerID
  from_id: number
  text: string
  random_id: number
  ref?: string
  ref_source?: string
  // attachments: IAttachment[]
  important: boolean
  // geo: IGeo
  payload?: string
  // keyboard: any
  fwd_messages: IMessage[]
  reply_message: IMessage
  action?: {
    type: IConversationActionType
    member_id: number
    text: string
    email: string
    // photo: IConversationPhoto
  }
  // admin_author_id: any
  conversation_message_id: number
  is_cropped?: boolean
  members_count?: number
  update_time?: UnixDate
  was_listened?: boolean
  pinned_at?: number
  message_tag?: string
}

interface IConversation {
  peer: IPeer
  in_read: number
  out_read: number
  unread_count: number | undefined
  important: boolean
  unanswered: boolean
  // push_settings: IPushSettings
  can_write: {
    allowed: boolean
    reason: string | undefined | number
  }
  chat_settings?: {
    members_count: number
    title: string
    // pinned_message: any
    // state: ChatSettingsState
    photo: IConversationPhoto
    active_ids: number[]
    is_group_channel: boolean
  }
}

type IConversationsResponseItem = {
  conversation: IConversation
  last_message: IMessage
  profiles: IProfile
}

type IBaseProfile = {
  id: number
  first_name: string
  last_name: string
  deactivated: string
  is_closed: boolean
  can_access_closed: boolean
}

type IBooleanNum = 0 | 1

type IUserCity = {
  id: number
  title: string
}

type IUserCountry = IUserCity

type IUserContacts = {
  mobile_string: string
  home_phone: string
}

type IProfileCounters = {
  albums: number
  videos: number
  audios: number
  photos: number
  notes: number
  friends: number
  groups: number
  online_friends: number
  mutual_friends: number
  user_videos: number
  followers: number
  pages: number
}

type ICropData = {
  x: number
  y: number
  x2: number
  y2: number
}

type ICropRect = ICropData

type ICropPhoto = {
  photo: any // TODO: add IPhoto type
  crop: ICropData
  rect: ICropRect
}

type IProfileEducation = {
  university: number
  university_name: string
  faculty: number
  faculty_name: string
  graduation: number
}

type IFriendStatus = 0 | 1 | 2 | 3

interface IProfile extends IBaseProfile {
  about: string
  activities: string
  bdate: string
  blacklisted: IBooleanNum
  blacklisted_by_me: IBooleanNum
  books: string
  can_post: IBooleanNum
  can_see_all_posts: IBooleanNum
  can_see_audio: IBooleanNum
  can_send_friend_request: IBooleanNum
  can_write_private_message: IBooleanNum
  career: any
  city: IUserCity
  common_count: number
  connections: any[]
  contacts: IUserContacts
  counters: IProfileCounters
  country: IUserCountry
  crop_photo: ICropPhoto
  domain: string
  education: IProfileEducation
  exports: any
  first_name_nom: string
  first_name_gen: string
  first_name_dat: string
  first_name_acc: string
  first_name_ins: string
  first_name_abl: string
  followers_count: number
  friend_status: IFriendStatus
  games: string
  has_mobile: IBooleanNum
  has_photo: IBooleanNum
  home_town: string
  interests: string
  is_favorite: IBooleanNum
  is_friend: IBooleanNum
  is_hidden_from_feed: IBooleanNum
  is_no_index: IBooleanNum
}

export {
  IBooleanNum,
  ICropData,
  IUserCity,
  IUserContacts,
  IBaseProfile,
  IMessage,
  IConversation,
  IConversationPhoto,
  IMessageID,
  IPushSettings,
  IPeer,
  IAttachment,
  IConversationActionType,
  IConversationsResponseItem,
  ICropPhoto,
  UnixDate,
  ICropRect,
  ChatSettingsState,
  IFriendStatus,
  IGeo,
  IPeerID,
  IProfile,
  IProfileCounters,
  IProfileEducation,
  IUserCountry,
}
