import { defineView } from '../ViewRegistry'
import BasicView from './BasicView'
import MonthView from './MonthView'

defineView('basic', {
  'class': BasicView
})

defineView('basicDay', {
  type: 'basic',
  duration: { days: 1 }
})

defineView('basicWeek', {
  type: 'basic',
  duration: { weeks: 1 }
})

defineView('month', {
  'class': MonthView,
  duration: { months: 1 }, // important for prev/next
  defaults: {
    fixedWeekCount: true
  }
})
