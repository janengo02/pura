import { combineReducers } from 'redux'
import alert from './alertReducers'
import auth from './authReducers'
import loading from './loadingReducers'
import page from './pageReducers'
import task from './taskReducers'
import googleAccount from './googleAccountReducers'
import languageReducer from './languageReducer'

export default combineReducers({
   loading,
   alert,
   auth,
   page,
   task,
   googleAccount,
   language: languageReducer
})
