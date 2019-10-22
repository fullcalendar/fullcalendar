import { createPlugin } from '@fullcalendar/core'
import TimeColsView from './TimeColsView'
import DayTimeColsView, { buildDayTableModel } from './DayTimeColsView'
import { TimeColsSeg, TimeColsRenderProps } from './TimeCols'
import { DayTimeColsSlicer, buildDayRanges } from './DayTimeCols'

export { DayTimeColsView, TimeColsView, buildDayTableModel, buildDayRanges, DayTimeColsSlicer, TimeColsSeg, TimeColsRenderProps }
export { default as TimeCols } from './TimeCols'

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
