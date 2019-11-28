import { createPlugin } from '@fullcalendar/core'
import AbstractTimeGridView from './AbstractTimeGridView'
import TimeGridView, { buildDayTable } from './TimeGridView'
import { TimeGridSeg } from './TimeGrid'
import { TimeGridSlicer, buildDayRanges } from './SimpleTimeGrid'

export { TimeGridView, AbstractTimeGridView, buildDayTable, buildDayRanges, TimeGridSlicer, TimeGridSeg }
export { default as TimeGrid, TimeGridProps, TimeGridCell, RenderProps } from './TimeGrid'
export { default as AllDaySplitter } from './AllDaySplitter'
export { default as SimpleTimeGrid, SimpleTimeGridProps } from './SimpleTimeGrid'
export { default as TimeGridEventRenderer } from './TimeGridEventRenderer'
export { default as TimeGridFillRenderer } from './TimeGridFillRenderer'
export { default as TimeGridMirrorRenderer } from './TimeGridMirrorRenderer'

export default createPlugin({
  defaultView: 'timeGridWeek',
  views: {

    timeGrid: {
      class: TimeGridView,
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
