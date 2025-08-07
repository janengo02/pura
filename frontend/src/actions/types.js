// =============================================================================
// APPLICATION STATE MANAGEMENT ACTION TYPES
// =============================================================================

// Loading States
export const START_LOADING = 'START_LOADING'
export const END_LOADING = 'END_LOADING'

// Alert System
export const SET_ALERT = 'SET_ALERT'
export const REMOVE_ALERT = 'REMOVE_ALERT'
export const REMOVE_ALL_ALERTS = 'REMOVE_ALL_ALERTS'

// Authentication
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS'
export const REGISTER_FAIL = 'REGISTER_FAIL'
export const USER_LOADED = 'USER_LOADED'
export const AUTH_ERROR = 'AUTH_ERROR'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAIL = 'LOGIN_FAIL'
export const LOGOUT = 'LOGOUT'

// Page Management
export const GET_PAGE = 'GET_PAGE'
export const PAGE_ERROR = 'PAGE_ERROR'
export const DROP_TASK = 'DROP_TASK'

// Page Filtering
export const FILTER_SCHEDULE = 'FILTER_SCHEDULE'
export const FILTER_NAME = 'FILTER_NAME'

// Progress Management
export const CREATE_PROGRESS = 'CREATE_PROGRESS'
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS'
export const DELETE_PROGRESS = 'DELETE_PROGRESS'

// Group Management
export const CREATE_GROUP = 'CREATE_GROUP'
export const UPDATE_GROUP = 'UPDATE_GROUP'
export const DELETE_GROUP = 'DELETE_GROUP'

// Task Management
export const SHOW_TASK = 'SHOW_TASK'
export const CLEAR_TASK = 'CLEAR_TASK'
export const CREATE_TASK = 'CREATE_TASK'
export const UPDATE_TASK_BASIC = 'UPDATE_TASK_BASIC'
export const DELETE_TASK = 'DELETE_TASK'
export const MOVE_TASK = 'MOVE_TASK'

// Task Schedule Management
export const CREATE_TASK_SCHEDULE = 'CREATE_TASK_SCHEDULE'
export const UPDATE_TASK_SCHEDULE = 'UPDATE_TASK_SCHEDULE'
export const DELETE_TASK_SCHEDULE = 'DELETE_TASK_SCHEDULE'
export const SYNC_TASK_EVENT = 'SYNC_TASK_EVENT'

// Google Calendar Account Management
export const GET_CALENDAR = 'GET_CALENDAR'
export const CALENDAR_AUTH_ERROR = 'CALENDAR_AUTH_ERROR'
export const ADD_CALENDAR_ACCOUNT = 'ADD_CALENDAR_ACCOUNT'
export const REMOVE_CALENDAR_ACCOUNT = 'REMOVE_CALENDAR_ACCOUNT'
export const SET_CALENDAR_DEFAULT_ACCOUNT = 'SET_CALENDAR_DEFAULT_ACCOUNT'
export const GET_CALENDAR_DEFAULT_ACCOUNT = 'GET_CALENDAR_DEFAULT_ACCOUNT'

// Google Calendar Management
export const UPDATE_CALENDAR_RANGE = 'UPDATE_CALENDAR_RANGE'
export const UPDATE_CALENDAR_VISIBILITY = 'UPDATE_CALENDAR_VISIBILITY'

// Google Calendar Event Management
export const UPDATE_CALENDAR_EVENT = 'UPDATE_CALENDAR_EVENT'
export const UPDATE_CALENDAR_EVENT_TIME = 'UPDATE_CALENDAR_EVENT_TIME'
export const DELETE_CALENDAR_EVENT = 'DELETE_CALENDAR_EVENT'
export const CREATE_CALENDAR_EVENT = 'CREATE_CALENDAR_EVENT'

// Event Edit Modal
export const SHOW_EVENT_EDIT_MODAL = 'SHOW_EVENT_EDIT_MODAL'
export const CLEAR_EVENT_EDIT_MODAL = 'CLEAR_EVENT_EDIT_MODAL'

// Language Management
export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE'
export const LANGUAGE_ERROR = 'LANGUAGE_ERROR'

// Theme Management
export const TOGGLE_THEME = 'TOGGLE_THEME'
export const SET_THEME = 'SET_THEME'
export const INITIALIZE_THEME = 'INITIALIZE_THEME'