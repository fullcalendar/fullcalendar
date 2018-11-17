import { defineView } from '../ViewRegistry'
import BasicView from './BasicView'

defineView('basic', BasicView)

defineView('basicDay', {
  type: 'basic',
  duration: { days: 1 }
})

defineView('basicWeek', {
  type: 'basic',
  duration: { weeks: 1 }
})

defineView('month', {
  type: 'basic',
  monthMode: true,
  duration: { months: 1 }, // important for prev/next
  fixedWeekCount: true
})
