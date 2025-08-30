import { combineReducers } from 'redux'
import alert from './alertSlice'
import auth from './authSlice'
import page from './pageReducers'
import pageSlice from './pageSlice'
import task from './taskReducers'
import calendar from './calendarReducers'
import language from './languageSlice'
import theme from './themeSlice'
import event from './eventSlice'
import { baseApi } from '../api/baseApi'

export default combineReducers({
   alert,
   auth,
   page, // Legacy page reducer for backward compatibility
   pageSlice, // New RTK Query integrated page slice
   task,
   calendar,
   language,
   theme,
   event,
   [baseApi.reducerPath]: baseApi.reducer
})
