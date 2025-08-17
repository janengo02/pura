// =============================================================================
// EVENT REDUCER
// =============================================================================

import { SHOW_EVENT_EDIT_MODAL, CLEAR_EVENT_EDIT_MODAL } from '../actions/types'

const initialState = {
   id: null,
   title: null,
   description: null,
   color: null,
   start: null,
   end: null,
   eventType: null,
   calendarId: null,
   accountEmail: null,
   puraTaskId: null,
   puraScheduleIndex: null,
   googleEventId: null
}

function eventReducer(state = initialState, action) {
   const { type, payload } = action

   switch (type) {
      case SHOW_EVENT_EDIT_MODAL:
         return {
            ...state,
            ...payload
         }

      case CLEAR_EVENT_EDIT_MODAL:
         return {
            ...state,
            id: null,
            title: null,
            description: null,
            color: null,
            start: null,
            end: null,
            eventType: null,
            calendarId: null,
            accountEmail: null,
            puraTaskId: null,
            puraScheduleIndex: null,
            googleEventId: null
         }

      default:
         return state
   }
}

export default eventReducer
