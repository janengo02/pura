import { combineReducers } from 'redux'
import alert from './alert'
import auth from './auth'
import loading from './loading'
import page from './page'
import task from './task'
import googleAccount from './googleAccount'

export default combineReducers({
   loading,
   alert,
   auth,
   page,
   task,
   googleAccount
})
