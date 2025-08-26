import { createSlice } from '@reduxjs/toolkit'

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

const eventSlice = createSlice({
   name: 'event',
   initialState,
   reducers: {
      showEventEditModal: (state, action) => {
         return {
            ...state,
            ...action.payload
         }
      },
      clearEventEditModal: (state) => {
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
      }
   }
})

export const { showEventEditModal, clearEventEditModal } = eventSlice.actions
export default eventSlice.reducer