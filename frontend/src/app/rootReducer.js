import { combineReducers } from 'redux'
import alert from '../features/ui/alertSlice'
import auth from '../features/auth/authSlice'
import pageSlice from '../features/kanban/pageSlice'
import taskSlice from '../features/task/taskSlice'
import calendarSlice from '../features/calendar/calendarSlice'
import language from '../features/ui/languageSlice'
import theme from '../features/ui/themeSlice'
import event from '../features/event/eventSlice'
import { baseApi } from '../shared/api/baseApi'

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
