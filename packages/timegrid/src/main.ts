import { createPlugin } from '@fullcalendar/core'
import TimeColsView from './TimeColsView'
import DayTimeColsView, { buildTimeColsModel } from './DayTimeColsView'
import { TimeColsSeg } from './TimeCols'
import { default as DayTimeCols, DayTimeColsSlicer, buildDayRanges } from './DayTimeCols'
import './main.scss'

export { DayTimeCols, DayTimeColsView, TimeColsView, buildTimeColsModel, buildDayRanges, DayTimeColsSlicer, TimeColsSeg }
export { default as TimeCols, TIME_COLS_NOW_INDICATOR_UNIT } from './TimeCols'
export { TimeColsSlatsBody } from './TimeColsSlats'
export { TimeColsContentBody } from './TimeColsContent'
export { default as TimeColsSlatsCoords } from './TimeColsSlatsCoords'

export default createPlugin({
  defaultView: 'timeGridWeek',
  views: {

    timeGrid: {
      class: DayTimeColsView,
      allDaySlot: true,
      slotDuration: '00:30:00',
      slotEventOverlap: true // a bad name. confused with overlap/constraint system
    },

    timeGridDay: {
      type: 'timeGrid',
      duration: { days: 1 }
    },

    timeGridWeek: {
      type: 'timeGrid',
      duration: { weeks: 1 }
    }

  }
})
