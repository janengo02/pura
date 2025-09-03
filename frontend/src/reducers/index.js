import { combineReducers } from 'redux'
import alert from './alertSlice'
import auth from './authSlice'
import pageSlice from './pageSlice'
import taskSlice from './taskSlice'
import calendarSlice from './calendarSlice'
import language from './languageSlice'
import theme from './themeSlice'
import event from './eventSlice'
import { baseApi } from '../api/baseApi'

export default combineReducers({
   alert,
   auth,
   pageSlice,
   taskSlice,
   calendarSlice,
   language,
   theme,
   event,
   [baseApi.reducerPath]: baseApi.reducer
})
