import { combineReducers } from 'redux'
import { baseApi } from '../api/baseApi'
import alert from './alertSlice'
import auth from './authSlice'
import loading from './loadingSlice'
import page from './pageSlice'
import task from './taskSlice'
import calendar from './calendarSlice'
import language from './languageSlice'
import theme from './themeSlice'
import event from './eventSlice'

// Legacy reducers (to be removed after migration)
import legacyPage from './pageReducers'
import legacyTask from './taskReducers'
import legacyCalendar from './calendarReducers'

export default combineReducers({
   // RTK Query API reducer is handled in store.js
   loading,
   alert,
   auth,
   // New RTK slices  
   page,
   task,
   calendar,
   // Legacy reducers (maintain during transition)
   legacyPage,
   legacyTask,
   legacyCalendar,
   language,
   theme,
   event
})
