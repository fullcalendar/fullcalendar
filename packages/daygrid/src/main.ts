import { createPlugin } from '@fullcalendar/core'
import DayGridView from './DayGridView'

export { default as SimpleDayGrid, DayGridSlicer, SimpleDayGridProps } from './SimpleDayGrid'
export { default as DayGrid, DayGridSeg, DayGridCell, DayGridProps, RenderProps } from './DayGrid'
export { default as AbstractDayGridView } from './AbstractDayGridView'
export { default as DayGridView, buildDayTable as buildBasicDayTable } from './DayGridView'
export { default as DayBgRow, DayBgCell, DayBgRowProps } from './DayBgRow'
export { default as DayGridDateProfileGenerator } from './DayGridDateProfileGenerator'
export { default as DayGridEventRenderer } from './DayGridEventRenderer'
export { default as DayGridFillRenderer } from './DayGridFillRenderer'
export { default as DayGridMirrorRenderer } from './DayGridMirrorRenderer'
export { default as DayTile, DayTileEventRenderer, DayTileProps } from './DayTile'
export { default as Popover, PopoverOptions } from './Popover'
export { default as SimpleDayGridEventRenderer } from './SimpleDayGridEventRenderer'

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
