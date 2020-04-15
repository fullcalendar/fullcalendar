import { createPlugin } from '@fullcalendar/core'
import { TimeColsView } from './TimeColsView'
import { DayTimeColsView, buildTimeColsModel } from './DayTimeColsView'
import { TimeColsSeg } from './TimeColsSeg'
import { DayTimeCols, DayTimeColsSlicer, buildDayRanges } from './DayTimeCols'
import './main.scss'

export { DayTimeCols, DayTimeColsView, TimeColsView, buildTimeColsModel, buildDayRanges, DayTimeColsSlicer, TimeColsSeg }
export { TimeCols } from './TimeCols'
export { TimeSlatMeta, buildSlatMetas } from './TimeColsSlats'
export { TimeColsSlatsCoords } from './TimeColsSlatsCoords'

export default createPlugin({
  initialView: 'timeGridWeek',
  views: {

    timeGrid: {
      component: DayTimeColsView,
      usesMinMaxTime: true, // indicates that slotMinTime/slotMaxTime affects rendering
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
