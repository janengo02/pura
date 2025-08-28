import { combineReducers } from 'redux'
import alert from './alertSlice'
import auth from './authSlice'
import page from './pageReducers'
import task from './taskReducers'
import calendar from './calendarReducers'
import language from './languageSlice'
import theme from './themeSlice'
import event from './eventSlice'
import { baseApi } from '../api/baseApi'

export default combineReducers({
   alert,
   auth,
   page,
   task,
   calendar,
   language,
   theme,
   event,
   [baseApi.reducerPath]: baseApi.reducer
})
