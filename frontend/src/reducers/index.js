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

// Combined reducers for app state
const appReducer = combineReducers({
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

// Root reducer with reset functionality (modern RTK pattern)
const rootReducer = (state, action) => {
   // Reset state on logout but preserve user preferences
   if (action.type === 'auth/logout') {
      // Create new state with only preserved slices
      const { language, theme } = state || {}

      // Reset to undefined to get initial state, but preserve user preferences
      state = {
         language,
         theme
      }
   }

   return appReducer(state, action)
}

export default rootReducer
