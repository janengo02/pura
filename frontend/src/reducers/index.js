import { combineReducers } from 'redux'
import alert from './alertReducers'
import auth from './authReducers'
import loading from './loadingReducers'
import page from './pageReducers'
import task from './taskReducers'
import calendar from './calendarReducers'
import language from './languageReducer'
import theme from '../reducers/themeReducer'
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
