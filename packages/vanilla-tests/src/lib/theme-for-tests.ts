import { CalendarOptions, joinClassNames, PluginInput } from 'fullcalendar'

/*
NOTE: other classnames in theme-for-tests-premium.ts
*/

const dayRowCommonClasses: CalendarOptions = {
  dayCellClass: 'fc-daygrid-day',
  dayCellTopClass: 'fc-daygrid-day-header',
  dayCellTopInnerClass: (info) => joinClassNames(
    'fc-daygrid-day-number',
    info.monthText && 'fc-daygrid-month-start',
  ),
  rowEventClass: 'fc-daygrid-event fc-daygrid-block-event',
  listItemEventClass: 'fc-daygrid-event fc-daygrid-dot-event',
  rowMoreLinkClass: 'fc-daygrid-more-link',
}

export default {
  name: 'theme-for-tests',
  optionDefaults: {
    headerToolbar: {
      start: 'title',
      end: 'today prev,next',
    },
    className: 'fc',
    toolbarClass: 'fc-toolbar',
    headerToolbarClass: 'fc-header-toolbar',
    footerToolbarClass: 'fc-footer-toolbar',
    toolbarSectionClass: 'fc-toolbar-section',
    toolbarTitleClass: 'fc-toolbar-title',
    viewClass: (info) => joinClassNames(
      'fc-view',
      `fc-${info.view.type}-view`,
    ),
    buttonClass: (info) => joinClassNames(
      'fc-button',
      `fc-${info.name}-button`,
    ),
    buttonGroupClass: 'fc-button-group',
    popoverClass: 'fc-more-popover',
    popoverCloseClass: 'fc-popover-close',
    navLinkClass: 'fc-navlink',
    nonBusinessHoursClass: 'fc-non-business',
    highlightClass: 'fc-highlight',
    backgroundEventClass: 'fc-bg-event',
    eventClass: (info) => joinClassNames(
      'fc-event',
      info.isMirror && 'fc-event-mirror',
      info.isStart && 'fc-event-start',
      info.isEnd && 'fc-event-end',
      info.isPast && 'fc-event-past',
      info.isFuture && 'fc-event-future',
    ),
    eventTimeClass: 'fc-event-time',
    eventTitleClass: 'fc-event-title',
    eventBeforeClass: (info) => joinClassNames(
      info.isStartResizable && 'fc-event-resizer fc-event-resizer-start',
    ),
    eventAfterClass: (info) => joinClassNames(
      info.isEndResizable && 'fc-event-resizer fc-event-resizer-end',
    ),
    dayHeaderClass: (info) => joinClassNames(
      getDayClass(info),
      info.inPopover && 'fc-popover-header',
    ),
    dayHeaderInnerClass: (info) => joinClassNames(
      info.inPopover && 'fc-popover-title',
    ),
    dayCellClass: (info) => getDayClass(info),
    slotHeaderClass: (info) => getSlotClass(info),
    slotLaneClass: (info) => getSlotClass(info),
  },
  views: {
    dayGrid: {
      ...dayRowCommonClasses,
      viewClass: 'fc-daygrid',
      tableHeaderClass: 'fc-daygrid-header',
      tableBodyClass: 'fc-daygrid-body',
      inlineWeekNumberClass: 'fc-daygrid-week-number',
    },
    timeGrid: {
      ...dayRowCommonClasses,
      viewClass: 'fc-timegrid',
      tableHeaderClass: 'fc-timegrid-header',
      tableBodyClass: 'fc-timegrid-body',
      columnMoreLinkClass: 'fc-timegrid-more-link',
      weekNumberHeaderClass: 'fc-timegrid-axis',
      weekNumberHeaderInnerClass: 'fc-timegrid-axis-inner',
      allDayHeaderClass: 'fc-timegrid-allday-header fc-timegrid-axis',
      slotHeaderClass: (info) => joinClassNames(
        'fc-timegrid-slot-label',
        'fc-timegrid-axis',
        getTimeGridSlotClass(info),
      ),
      slotLaneClass: (info) => joinClassNames(
        'fc-timegrid-slot-lane',
        getTimeGridSlotClass(info),
      ),
      dayLaneClass: 'fc-timegrid-day',
      nowIndicatorHeaderClass: 'fc-timegrid-now-indicator-arrow',
      nowIndicatorLineClass: 'fc-timegrid-now-indicator-line',
      columnEventClass: (info) => joinClassNames(
        'fc-timegrid-event',
        info.isShort && 'fc-timegrid-event-short',
      ),
    },
    multiMonth: {
      ...dayRowCommonClasses,
      viewClass: 'fc-multimonth',
      singleMonthClass: 'fc-multimonth-month',
      singleMonthHeaderClass: 'fc-multimonth-title',
      dayHeaderRowClass: 'fc-multimonth-header-row',
    },
    list: {
      viewClass: 'fc-list',
      listDayHeaderClass: 'fc-list-day',
      listDayHeaderInnerClass: (info) => (
        info.level ? 'fc-list-day-side-text' : 'fc-list-day-text'
      ),
      listItemEventClass: 'fc-list-event',
      listItemEventBeforeClass: 'fc-list-event-dot',
      listItemEventTitleClass: 'fc-list-event-title',
      listItemEventTimeClass: 'fc-list-event-time',
      noEventsClass: 'fc-list-empty',
    }
  }
} as PluginInput

// Utils
// -------------------------------------------------------------------------------------------------

const DAY_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function getDayClass(info: any): string {
  return info.isDisabled
    ? joinClassNames(
        'fc-day',
        'fc-day-disabled',
      )
    : joinClassNames(
        'fc-day',
        `fc-day-${DAY_IDS[info.dow]}`,
        info.isToday && 'fc-day-today',
        info.isPast && 'fc-day-past',
        info.isFuture && 'fc-day-future',
      )
}

function getSlotClass(info: any): string {
  return info.isDisabled
    ? joinClassNames(
        'fc-slot',
        'fc-slot-disabled',
      )
    : joinClassNames(
        'fc-slot',
        `fc-slot-${DAY_IDS[info.dow]}`,
        info.isToday && 'fc-slot-today',
        info.isPast && 'fc-slot-past',
        info.isFuture && 'fc-slot-future',
      )
}

function getTimeGridSlotClass(info: any): string {
  return joinClassNames(
    'fc-timegrid-slot',
    info.isMinor && 'fc-timegrid-slot-minor',
  )
}
