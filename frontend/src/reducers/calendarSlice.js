import { createSlice } from '@reduxjs/toolkit'
import { calendarApi } from '../api/calendarApi'
import { loadGoogleCalendarHelper } from './calendarReducersHelpers'

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

export const { updateCalendarRange, navigateCalendarToDate } = calendarSlice.actions
export default calendarSlice.reducer