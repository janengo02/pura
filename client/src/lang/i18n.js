import { initReactI18next } from "react-i18next"
import i18n from "i18next"
import en from "./en.json"
import ja from "./ja.json"

const language = "en"
const resources = {
   en: { ...en },
   ja: { ...ja }
}

i18n
   .use(initReactI18next) // passes i18n down to react-i18next
   .init({
      resources,
      lng: language,
      interpolation: {
         escapeValue: false // react already safes from xss
      },
      react: {
         transKeepBasicHtmlNodesFor: ["br", "wbr"]
      }
   })

export default i18n
