import { createPlugin } from '@fullcalendar/core'
import DayGridView from './DayGridView'

export { default as SimpleDayGrid, DayGridSlicer } from './SimpleDayGrid'
export { default as DayGrid, DayGridSeg } from './DayGrid'
export { default as AbstractDayGridView } from './AbstractDayGridView'
export { default as DayGridView, buildDayTable as buildBasicDayTable } from './DayGridView'
export { default as DayBgRow } from './DayBgRow'

export default createPlugin({
  defaultView: 'dayGridMonth',
  views: {

    dayGrid: DayGridView,

    dayGridDay: {
      type: 'dayGrid',
      duration: { days: 1 }
    },

    dayGridWeek: {
      type: 'dayGrid',
      duration: { weeks: 1 }
    },

    dayGridMonth: {
      type: 'dayGrid',
      duration: { months: 1 },
      monthMode: true,
      fixedWeekCount: true
    }

  }
})
