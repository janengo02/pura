import { combineReducers } from 'redux'
import alert from './alertReducers'
import auth from './authReducers'
import loading from './loadingSlice'
import page from './pageReducers'
import task from './taskReducers'
import calendar from './calendarReducers'
import language from './languageSlice'
import theme from './themeSlice'
import event from '../reducers/eventReducers'

export default combineReducers({
   loading,
   alert,
   auth,
   page,
   task,
   calendar,
   language,
   theme,
   event
})
