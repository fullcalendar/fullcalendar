import { createPlugin } from '@fullcalendar/core'
import ListView from './ListView'

export { ListView }

export default createPlugin({
  views: {

    list: {
      class: ListView,
      buttonTextKey: 'list', // what to lookup in locale files
      listDayFormat: { month: 'long', day: 'numeric', year: 'numeric' } // like "January 1, 2016"
    },

    listDay: {
      type: 'list',
      duration: { days: 1 },
      listDayFormat: { weekday: 'long' } // day-of-week is all we need. full date is probably in header
    },

    listWeek: {
      type: 'list',
      duration: { weeks: 1 },
      listDayFormat: { weekday: 'long' }, // day-of-week is more important
      listDayAltFormat: { month: 'long', day: 'numeric', year: 'numeric' }
    },

    listMonth: {
      type: 'list',
      duration: { month: 1 },
      listDayAltFormat: { weekday: 'long' } // day-of-week is nice-to-have
    },

    listYear: {
      type: 'list',
      duration: { year: 1 },
      listDayAltFormat: { weekday: 'long' } // day-of-week is nice-to-have
    }

  }
})
