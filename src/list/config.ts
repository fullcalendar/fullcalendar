import { defineView } from '../ViewRegistry'
import ListView from './ListView'

defineView('list', {
  class: ListView,
  buttonTextKey: 'list', // what to lookup in locale files
  listDayFormat: { month: 'long', day: 'numeric', year: 'numeric' } // like "January 1, 2016"
})

defineView('listDay', {
  type: 'list',
  duration: { days: 1 },
  listDayFormat: { weekday: 'long' } // day-of-week is all we need. full date is probably in header
})

defineView('listWeek', {
  type: 'list',
  duration: { weeks: 1 },
  listDayFormat: { weekday: 'long' }, // day-of-week is more important
  listDayAltFormat: { month: 'long', day: 'numeric', year: 'numeric' }
})

defineView('listMonth', {
  type: 'list',
  duration: { month: 1 },
  listDayAltFormat: { weekday: 'long' } // day-of-week is nice-to-have
})

defineView('listYear', {
  type: 'list',
  duration: { year: 1 },
  listDayAltFormat: { weekday: 'long' } // day-of-week is nice-to-have
})
