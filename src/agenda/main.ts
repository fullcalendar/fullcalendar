import { createPlugin } from 'fullcalendar'
import AbstractAgendaView from './AbstractAgendaView'
import AgendaView, { buildDayTable } from './AgendaView'
import { TimeGridSeg } from './TimeGrid'
import { TimeGridSlicer, buildDayRanges } from './SimpleTimeGrid'

export { AgendaView, AbstractAgendaView, buildDayTable, buildDayRanges, TimeGridSlicer, TimeGridSeg }
export { default as TimeGrid } from './TimeGrid'

export default createPlugin({
  viewConfigs: {

    agenda: {
      class: AgendaView,
      allDaySlot: true,
      slotDuration: '00:30:00',
      slotEventOverlap: true // a bad name. confused with overlap/constraint system
    },

    agendaDay: {
      type: 'agenda',
      duration: { days: 1 }
    },

    agendaWeek: {
      type: 'agenda',
      duration: { weeks: 1 }
    }

  }
})
