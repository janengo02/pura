import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'

const initialState = []

const alertSlice = createSlice({
   name: 'alert',
   initialState,
   reducers: {
      addAlert: {
         reducer: (state, action) => {
            // Add alert to array
            state.push(action.payload)
         },
         prepare: (title, msg, alertType) => ({
            payload: { title, msg, alertType, id: uuid() }
         })
      },
      setAlert: {
         reducer: (state, action) => {
            // Replace all alerts with new one
            return [action.payload]
         },
         prepare: (title, msg, alertType) => ({
            payload: { title, msg, alertType, id: uuid() }
         })
      },
      removeAlert: (state, action) => {
         // Filter out alert by ID
         return state.filter((alert) => alert.id !== action.payload)
      },
      removeAllAlerts: () => {
         // Reset to empty array
         return []
      }
   }
})

// Export action creators (modern RTK pattern with prepare functions)
export const { addAlert, setAlert, removeAlert, removeAllAlerts } = alertSlice.actions

// Export reducer
export default alertSlice.reducer