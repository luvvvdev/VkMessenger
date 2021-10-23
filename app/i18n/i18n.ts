import * as Localization from "expo-localization"
import i18n from "i18n-js"
import ru from "./ru.json"
import ja from "./ja.json"

i18n.fallbacks = true
i18n.translations = { ru, ja }

//Localization.locale ||
i18n.locale = "ru"

/**
 * Builds up valid keypaths for translations.
 * Update to your default locale of choice if not English.
 */
type DefaultLocale = typeof ru
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>

type RecursiveKeyOf<TObj extends Record<string, any>> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, any>
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`
}[keyof TObj & string]
