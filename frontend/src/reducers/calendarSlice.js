import { createSlice } from '@reduxjs/toolkit'
import { calendarApi } from '../api/calendarApi'
import { loadGoogleCalendarHelper, toggleCalendarVisibilityHelper, createGoogleEvent, addGoogleAccount, removeGoogleAccount, deleteTaskEvents, addTaskScheduleSlot } from './calendarReducersHelpers'

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    googleEvents: [],
    googleCalendars: [],
    googleAccounts: [],
    defaultAccount: null,
    range: [],
    navigationTarget: null,
  },
  reducers: {
    updateCalendarRange: (state, action) => {
      state.range = action.payload.range
    },
    navigateCalendarToDate: (state, action) => {
      state.navigationTarget = action.payload
    },
    toggleCalendarVisibility: (state, action) => {
      const { calendarId } = action.payload
      const updatedState = toggleCalendarVisibilityHelper({
        googleCalendars: state.googleCalendars,
        googleEvents: state.googleEvents,
        calendarId
      })
      state.googleCalendars = updatedState.googleCalendars
      state.googleEvents = updatedState.googleEvents
      // @todo: Persist calendar visibility settings to backend or localStorage
    },
    createCalendarEvent: (state, action) => {
      const { newEvent, mousePosition } = action.payload
      const updatedState = createGoogleEvent({
        defaultAccount: state.defaultAccount,
        googleCalendars: state.googleCalendars,
        googleEvents: state.googleEvents,
        newEvent,
        newEventMousePosition: mousePosition
      })
      state.googleEvents = updatedState.googleEvents
    },
    clearCalendarEvent: (state) => {
      state.googleEvents = state.googleEvents.filter(
        (event) => event.id !== 'new'
      )
    },
    optimisticDeleteTask: (state, action) => {
      const { taskId } = action.payload
      const updatedState = deleteTaskEvents({
        googleEvents: state.googleEvents,
        taskDeletionData: { taskId }
      })
      state.googleEvents = updatedState.googleEvents
    },
    optimisticAddScheduleSlot: (state, action) => {
      const updatedState = addTaskScheduleSlot({
        googleEvents: state.googleEvents,
        addSlotData: action.payload
      })
      state.googleEvents = updatedState.googleEvents
    }
  },
  extraReducers: (builder) => {
    // Handle RTK Query loadCalendar states
    builder
      .addMatcher(calendarApi.endpoints.loadCalendar.matchFulfilled, (state, action) => {
        const calendarData = loadGoogleCalendarHelper({
          googleAccounts: action.payload.googleAccounts,
          tasks: action.payload.tasks
        })
        state.googleAccounts = calendarData.googleAccounts
        state.googleCalendars = calendarData.googleCalendars
        state.googleEvents = calendarData.googleEvents
        state.defaultAccount = calendarData.defaultAccount
      })
      .addMatcher(calendarApi.endpoints.setDefaultAccount.matchFulfilled, (state, action) => {
        const accountData = action.payload

        // Update default account in state
        state.defaultAccount = accountData?.id ? accountData : null

        // Update the isDefault flag for all accounts
        state.googleAccounts = state.googleAccounts.map(account => ({
          ...account,
          isDefault: account.accountEmail === accountData.accountEmail
        }))
      })
      .addMatcher(calendarApi.endpoints.addGoogleAccount.matchFulfilled, (state, action) => {
        const newGoogleAccountData = action.payload
        
        // Use the same helper function as the traditional reducer
        const updatedState = addGoogleAccount({
          googleAccounts: state.googleAccounts,
          googleCalendars: state.googleCalendars,
          googleEvents: state.googleEvents,
          newGoogleAccount: newGoogleAccountData
        })
        
        // Update state with new account, calendars, and events
        state.googleAccounts = updatedState.googleAccounts
        state.googleCalendars = updatedState.googleCalendars
        state.googleEvents = updatedState.googleEvents
        state.defaultAccount = updatedState.defaultAccount
      })
      .addMatcher(calendarApi.endpoints.disconnectGoogleAccount.matchFulfilled, (state, action) => {
        const { accountEmail } = action.meta.arg.originalArgs
        
        // Use the same helper function as the traditional reducer
        const updatedState = removeGoogleAccount({
          googleAccounts: state.googleAccounts,
          googleCalendars: state.googleCalendars,
          googleEvents: state.googleEvents,
          removedAccountEmail: accountEmail
        })
        
        // Update state after account removal
        state.googleAccounts = updatedState.googleAccounts
        state.googleCalendars = updatedState.googleCalendars
        state.googleEvents = updatedState.googleEvents
        state.defaultAccount = updatedState.defaultAccount
      })
  }
})

export const { updateCalendarRange, navigateCalendarToDate, toggleCalendarVisibility, createCalendarEvent, clearCalendarEvent, optimisticDeleteTask, optimisticAddScheduleSlot } = calendarSlice.actions
export default calendarSlice.reducer