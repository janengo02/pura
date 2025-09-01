import { createSlice } from '@reduxjs/toolkit'
import { calendarApi } from '../api/calendarApi'
import { loadGoogleCalendarHelper, toggleCalendarVisibilityHelper } from './calendarReducersHelpers'

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
  }
})

export const { updateCalendarRange, navigateCalendarToDate, toggleCalendarVisibility } = calendarSlice.actions
export default calendarSlice.reducer