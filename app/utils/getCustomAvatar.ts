import { CustomAvatar } from "../components/Avatar/Avatar"
import _ from "lodash"

export const getCustomAvatar = (): CustomAvatar => {
  const gradients = [
    ["#ff6952", "#e6404b"],
    ["#ffb829", "#fa7f14"],
    ["#ffdc50", "#f2b40b"],
    ["#78e070", "#46b864"],
    ["#78f1fa", "#46bddb"],
    ["#e664fa", "#a73ddb"],
    ["#66ccff", "#3f8ae0"],
    ["#bac2cc", "#8c97a3"],
  ]

  const emojis = [`🚀`, `🦄`, `🏳‍🌈`, `🍔`, `🍩`, `🍭`, `🍿`, `🍫`, `💰`, `💊`, `🎈`, `🌈`]

  return { gradient: _.sample(gradients), text: _.sample(emojis) }
}
