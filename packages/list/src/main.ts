import { createPlugin } from '@fullcalendar/common'
import { ListView } from './ListView'
import { OPTION_REFINERS } from './options'
import './options-declare'
import './main.css'

export { ListView }
export * from './api-type-deps'

export default createPlugin({
  optionRefiners: OPTION_REFINERS,
  views: {

    list: {
      component: ListView,
      buttonTextKey: 'list', // what to lookup in locale files
      listDayFormat: { month: 'long', day: 'numeric', year: 'numeric' }, // like "January 1, 2016"
    },

    listDay: {
      type: 'list',
      duration: { days: 1 },
      listDayFormat: { weekday: 'long' }, // day-of-week is all we need. full date is probably in headerToolbar
    },

    listWeek: {
      type: 'list',
      duration: { weeks: 1 },
      listDayFormat: { weekday: 'long' }, // day-of-week is more important
      listDaySideFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    },

    listMonth: {
      type: 'list',
      duration: { month: 1 },
      listDaySideFormat: { weekday: 'long' }, // day-of-week is nice-to-have
    },

    listYear: {
      type: 'list',
      duration: { year: 1 },
      listDaySideFormat: { weekday: 'long' }, // day-of-week is nice-to-have
    },

  },
})
