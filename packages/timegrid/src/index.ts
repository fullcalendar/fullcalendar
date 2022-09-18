import { createPlugin } from '@fullcalendar/core'
import { TimeColsView } from './TimeColsView.js'
import { DayTimeColsView, buildTimeColsModel } from './DayTimeColsView.js'
import { TimeColsSeg } from './TimeColsSeg.js'
import { DayTimeCols, buildDayRanges } from './DayTimeCols.js'
import { DayTimeColsSlicer } from './DayTimeColsSlicer.js'
import { OPTION_REFINERS } from './options.js'
import './options-declare.js'
import './index.css'

export { DayTimeCols, DayTimeColsView, TimeColsView, buildTimeColsModel, buildDayRanges, DayTimeColsSlicer, TimeColsSeg }
export { TimeCols } from './TimeCols.js'
export { TimeSlatMeta, buildSlatMetas } from './time-slat-meta.js'
export { TimeColsSlatsCoords } from './TimeColsSlatsCoords.js'

export default createPlugin({
  initialView: 'timeGridWeek',
  optionRefiners: OPTION_REFINERS,
  views: {

    timeGrid: {
      component: DayTimeColsView,
      usesMinMaxTime: true, // indicates that slotMinTime/slotMaxTime affects rendering
      allDaySlot: true,
      slotDuration: '00:30:00',
      slotEventOverlap: true, // a bad name. confused with overlap/constraint system
    },

    timeGridDay: {
      type: 'timeGrid',
      duration: { days: 1 },
    },

    timeGridWeek: {
      type: 'timeGrid',
      duration: { weeks: 1 },
    },

  },
})
