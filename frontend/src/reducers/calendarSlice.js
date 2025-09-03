import { createSlice } from '@reduxjs/toolkit'
import { calendarApi } from '../api/calendarApi'
import { loadGoogleCalendarHelper, toggleCalendarVisibilityHelper, createGoogleEvent, addGoogleAccount, removeGoogleAccount, deleteTaskEvents, addTaskScheduleSlot, deleteGoogleEvent, updateTaskEvents, updateTaskSchedule, removeTaskScheduleSlot, updateGoogleEvent, updateGoogleEventTime } from './calendarSliceHelpers'

const initialState = {
  googleEvents: [],
  googleCalendars: [],
  googleAccounts: [],
  defaultAccount: null,
  range: [],
  navigationTarget: null,
}

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
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
    },
    optimisticDeleteGoogleEvent: (state, action) => {
      const updatedState = deleteGoogleEvent({
        deletedEvent: action.payload,
        googleEvents: state.googleEvents
      })
      state.googleEvents = updatedState.googleEvents
    },
    optimisticUpdateTaskBasic: (state, action) => {
      const updatedState = updateTaskEvents({
        googleEvents: state.googleEvents,
        taskUpdateData: action.payload
      })
      state.googleEvents = updatedState.googleEvents
    },
    optimisticUpdateTaskSchedule: (state, action) => {
      const updatedState = updateTaskSchedule({
        googleEvents: state.googleEvents,
        scheduleUpdateData: action.payload
      })
      state.googleEvents = updatedState.googleEvents
    },
    optimisticRemoveTaskScheduleSlot: (state, action) => {
      const updatedState = removeTaskScheduleSlot({
        googleEvents: state.googleEvents,
        removalData: action.payload
      })
      state.googleEvents = updatedState.googleEvents
    },
    updateNewEvent: (state, action) => {
      const { updatedEvent, associatedCalendar } = action.payload

      // Format the calendar for the helper function
      const formattedCalendar = {
        id: associatedCalendar?.calendarId,
        summary: associatedCalendar?.title,
        backgroundColor: associatedCalendar?.color
      }

      const updatedState = updateGoogleEvent({
        originalEventId: 'new',
        googleEvents: state.googleEvents,
        updatedEvent,
        updatedCalendar: formattedCalendar
      })
      state.googleEvents = updatedState.googleEvents
    },
    optimisticUpdateGoogleEventTime: (state, action) => {
      const { eventId, start, end } = action.payload
      const updatedState = updateGoogleEventTime({
        eventId,
        googleEvents: state.googleEvents,
        start,
        end
      })
      state.googleEvents = updatedState.googleEvents
    },
    optimisticUpdateGoogleEvent: (state, action) => {
      const { event, calendar, originalEventId } = action.payload
      const updatedState = updateGoogleEvent({
        originalEventId,
        googleEvents: state.googleEvents,
        updatedEvent: event,
        updatedCalendar: calendar
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
      .addMatcher(calendarApi.endpoints.createGoogleEvent.matchFulfilled, (state, action) => {
        const { event, calendar } = action.payload

        // Add the new event to the calendar state and replace the 'new' event
        const updatedState = updateGoogleEvent({
          originalEventId: 'new',
          googleEvents: state.googleEvents,
          updatedEvent: event,
          updatedCalendar: calendar
        })
        state.googleEvents = updatedState.googleEvents
      })
      .addMatcher(calendarApi.endpoints.updateGoogleEvent.matchFulfilled, (state, action) => {
        const { event, calendar } = action.payload
        const { eventId } = action.meta.arg.originalArgs

        // Update the event with server response, replacing the optimistic update
        const updatedState = updateGoogleEvent({
          originalEventId: eventId,
          googleEvents: state.googleEvents,
          updatedEvent: event,
          updatedCalendar: calendar
        })
        state.googleEvents = updatedState.googleEvents
      })
  }
})

export const { updateCalendarRange, navigateCalendarToDate, toggleCalendarVisibility, createCalendarEvent, clearCalendarEvent, optimisticDeleteTask, optimisticAddScheduleSlot, optimisticDeleteGoogleEvent, optimisticUpdateTaskBasic, optimisticUpdateTaskSchedule, optimisticRemoveTaskScheduleSlot, updateNewEvent, optimisticUpdateGoogleEventTime, optimisticUpdateGoogleEvent } = calendarSlice.actions
export default calendarSlice.reducer