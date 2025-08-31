import { combineReducers } from 'redux'
import alert from './alertSlice'
import auth from './authSlice'
import page from './pageReducers'
import pageSlice from './pageSlice'
import task from './taskReducers'
import taskSlice from './taskSlice'
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
   task, // Legacy task reducer for backward compatibility (used by 8+ components)
   taskSlice, // New RTK Query integrated task slice (used by migrated components)
   calendar,
   language,
   theme,
   event,
   [baseApi.reducerPath]: baseApi.reducer
})
