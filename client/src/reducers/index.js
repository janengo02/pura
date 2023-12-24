import { combineReducers } from 'redux'
import alert from './alert'
import auth from './auth'
import loading from './loading'
import page from './page'

export default combineReducers({
   loading,
   alert,
   auth,
   page
})
