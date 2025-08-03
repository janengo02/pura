// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// External Libraries
import moment from 'moment'
import 'moment/locale/ja' // Import Japanese locale data
import {
   Calendar as BigCalendar,
   Views,
   momentLocalizer
} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// UI Components
import { Skeleton, useColorModeValue, VStack } from '@chakra-ui/react'

// Internal Components
import Toolbar from './calendar/toolbar/Toolbar'
import CalendarNavigationToolbar from './calendar/toolbar/CalendarNavigationToolbar'
import EventWrapper from './calendar/event/EventWrapper'

// Actions
import {
   loadCalendarAction,
   changeCalendarRangeAction
} from '../../actions/googleAccountActions'

// Utils
import { getRangeStart, getRangeEnd } from '../../utils/dates'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '@pura/shared'

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

// Available calendar views (excluding agenda)
const AVAILABLE_VIEWS = [Views.MONTH, Views.WEEK, Views.WORK_WEEK, Views.DAY]

// Style constants
const EVENT_TEXT_COLOR = '#1A202C'
const SELECTED_EVENT_SHADOW =
   '0px 6px 10px 0px rgba(0,0,0,.14),0px 1px 18px 0px rgba(0,0,0,.12),0px 3px 5px -1px rgba(0,0,0,.2)'

// Language-specific moment locale configurations
const LOCALE_CONFIGS = {
   ja: {
      week: { dow: 1 }, // Monday first
      weekdays: [
         '日曜日',
         '月曜日',
         '火曜日',
         '水曜日',
         '木曜日',
         '金曜日',
         '土曜日'
      ],
      weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
      weekdaysMin: ['日', '月', '火', '水', '木', '金', '土'],
      months: [
         '1月',
         '2月',
         '3月',
         '4月',
         '5月',
         '6月',
         '7月',
         '8月',
         '9月',
         '10月',
         '11月',
         '12月'
      ],
      monthsShort: [
         '1月',
         '2月',
         '3月',
         '4月',
         '5月',
         '6月',
         '7月',
         '8月',
         '9月',
         '10月',
         '11月',
         '12月'
      ],
      longDateFormat: {
         LT: 'HH:mm',
         LTS: 'HH:mm:ss',
         L: 'YYYY/MM/DD',
         LL: 'YYYY年M月D日',
         LLL: 'YYYY年M月D日 HH:mm',
         LLLL: 'YYYY年M月D日dddd HH:mm',
         l: 'YYYY/MM/DD',
         ll: 'YYYY年M月D日',
         lll: 'YYYY年M月D日 HH:mm',
         llll: 'YYYY年M月D日(ddd) HH:mm'
      },
      formats: {
         monthHeaderFormat: 'YYYY年M月',
         dayHeaderFormat: 'M月D日(ddd)',
         weekFormat: 'M月D日',
         agendaHeaderFormat: 'YYYY年M月D日'
      }
   },
   en: {
      week: { dow: 0 }, // Sunday first
      formats: {
         monthHeaderFormat: 'MMMM YYYY',
         dayHeaderFormat: 'dddd, MMMM D',
         weekFormat: 'MMMM D',
         agendaHeaderFormat: 'MMMM D, YYYY'
      }
   }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Configure moment locale based on current language
 * @param {string} currentLanguage - Current application language
 * @returns {object} Configured moment localizer
 */
const createLocalizedLocalizer = (currentLanguage) => {
   const config = LOCALE_CONFIGS[currentLanguage] || LOCALE_CONFIGS.en

   // Set moment global locale first with full configuration
   moment.locale(currentLanguage, config)

   // Force moment to use the new locale globally
   moment.locale(currentLanguage)

   // Create a fresh localizer instance with the configured moment
   const localizer = momentLocalizer(moment)

   // Override localizer formats for Japanese to ensure proper display
   if (currentLanguage === 'ja') {
      // Override the localizer's format methods to ensure Japanese display
      const originalFormat = localizer.format
      localizer.format = (value, format, culture) => {
         // Ensure moment is using Japanese locale for this format call
         const previousLocale = moment.locale()
         moment.locale('ja')
         const result = originalFormat.call(localizer, value, format, culture)
         moment.locale(previousLocale)
         return result
      }

      localizer.formats = {
         ...localizer.formats,
         monthHeaderFormat: 'YYYY年M月',
         dayHeaderFormat: 'M月D日(ddd)',
         weekHeaderFormat: 'M月D日',
         dayFormat: 'D (ddd)',
         weekdayFormat: 'dd',
         timeGutterFormat: 'HH:mm',
         eventTimeRangeFormat: ({ start, end }) => {
            return `${moment(start).locale('ja').format('HH:mm')} - ${moment(
               end
            )
               .locale('ja')
               .format('HH:mm')}`
         },
         agendaTimeFormat: 'HH:mm',
         agendaTimeRangeFormat: ({ start, end }) => {
            return `${moment(start).locale('ja').format('HH:mm')} - ${moment(
               end
            )
               .locale('ja')
               .format('HH:mm')}`
         }
      }
   }

   return localizer
}

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

/**
 * Wrapper component for date cells with custom styling
 */
const ColoredDateCellWrapper = ({ children }) => {
   // Use Chakra's color mode hook for dynamic background
   const bgColor = useColorModeValue('white', 'gray.700')

   return React.cloneElement(React.Children.only(children), {
      style: {
         backgroundColor: bgColor
      }
   })
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Calendar = React.memo(
   ({
      // Redux props
      loadCalendarAction,
      changeCalendarRangeAction,
      googleAccount: { googleEvents, loading, range },
      tasks,
      currentLanguage
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------
      const { currentLanguage: reactiveLanguage, t } = useReactiveTranslation()

      // Use reactive language to ensure updates when language changes
      const activeLanguage = reactiveLanguage || currentLanguage || 'en'

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      // Create language-aware localizer that updates when language changes
      const localizer = useMemo(
         () => createLocalizedLocalizer(activeLanguage),
         [activeLanguage]
      )

      // Calendar configuration with optimized performance
      const calendarConfig = useMemo(
         () => ({
            components: {
               timeSlotWrapper: ColoredDateCellWrapper,
               eventWrapper: EventWrapper,
               toolbar: CalendarNavigationToolbar
            },
            defaultDate: new Date(),
            views: AVAILABLE_VIEWS, // Excluded agenda view
            scrollToTime: new Date()
         }),
         []
      )

      // Filter visible events based on calendar visibility and set placeholder for empty titles
      const visibleEvents = useMemo(
         () =>
            googleEvents
               .filter((ev) => ev.calendarVisible)
               .map((ev) => ({
                  ...ev,
                  title: ev.title || t('placeholder-untitled')
               })),
         [googleEvents, t]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      // Handle calendar range changes (month/week navigation)
      const onRangeChange = useCallback(
         (newRange) => {
            if (!newRange || !range || !range.length) return
            let newRangeStart
            let newRangeEnd
            // Handle month view range change
            if (!Array.isArray(newRange)) {
               newRangeStart = getRangeStart(newRange.start, localizer)
               newRangeEnd = getRangeEnd(newRange.end, localizer)
            } else {
               newRangeStart = getRangeStart(newRange[0], localizer)
               newRangeEnd = getRangeEnd(newRange[1], localizer)
            }

            changeCalendarRangeAction([newRangeStart, newRangeEnd])
         },
         [changeCalendarRangeAction, localizer, range]
      )

      // Customize event appearance based on selection state
      const eventPropGetter = useCallback((event, start, end, isSelected) => {
         const eventOpacity = 1
         const backgroundColor = event.color
         const boxShadow = isSelected ? SELECTED_EVENT_SHADOW : 'none'

         // Add conflict styling for conflicted events
         const isConflicted =
            event.syncStatus === SCHEDULE_SYNCE_STATUS.CONFLICTED
         const className = isConflicted ? 'conflicted-event' : ''

         return {
            className: className,
            style: {
               opacity: eventOpacity,
               backgroundColor: backgroundColor,
               color: EVENT_TEXT_COLOR,
               boxShadow: boxShadow,
               outline: 'none'
            }
         }
      }, [])

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Update moment locale when language changes and force re-render
      useEffect(() => {
         const config = LOCALE_CONFIGS[activeLanguage] || LOCALE_CONFIGS.en

         // Configure moment globally
         moment.locale(activeLanguage, config)
         moment.locale(activeLanguage)

         // Force a small delay to ensure locale is fully applied
         const timer = setTimeout(() => {
            // Trigger any components that might need to re-render
            window.dispatchEvent(
               new CustomEvent('momentLocaleChanged', {
                  detail: { language: activeLanguage }
               })
            )
         }, 10)

         return () => clearTimeout(timer)
      }, [activeLanguage])

      useEffect(() => {
         if (range && range.length) {
            loadCalendarAction(range, tasks)
         }
      }, [range, loadCalendarAction, tasks])

      // Initialize calendar with default date range on mount
      useEffect(() => {
         const initialRange = [
            getRangeStart(calendarConfig.defaultDate, localizer),
            getRangeEnd(calendarConfig.defaultDate, localizer)
         ]
         changeCalendarRangeAction(initialRange)
      }, [calendarConfig.defaultDate, changeCalendarRangeAction, localizer])

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Skeleton isLoaded={!loading}>
            <VStack
               h='calc(100vh - 9rem)'
               alignItems='center'
               gap={2}
               paddingBottom={10}
            >
               <Toolbar />
               <BigCalendar
                  components={calendarConfig.components}
                  defaultDate={calendarConfig.defaultDate}
                  events={visibleEvents || []}
                  defaultView='week'
                  localizer={localizer}
                  showMultiDayTimes
                  step={30}
                  views={calendarConfig.views}
                  scrollToTime={calendarConfig.scrollToTime}
                  onRangeChange={onRangeChange}
                  on
                  eventPropGetter={eventPropGetter}
                  popup
                  culture={activeLanguage}
               />
            </VStack>
         </Skeleton>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Calendar.displayName = 'Calendar'

// PropTypes validation
Calendar.propTypes = {
   loadCalendarAction: PropTypes.func.isRequired,
   changeCalendarRangeAction: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired,
   tasks: PropTypes.array.isRequired,
   currentLanguage: PropTypes.string.isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectCalendarData = createSelector(
   [
      (state) => state.googleAccount,
      (state) => state.page.tasks,
      (state) => state.language?.current || 'en'
   ],
   (googleAccount, tasks, currentLanguage) => ({
      googleAccount,
      tasks,
      currentLanguage
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => selectCalendarData(state)

const mapDispatchToProps = {
   loadCalendarAction,
   changeCalendarRangeAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Calendar)
