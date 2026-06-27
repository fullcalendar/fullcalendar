import dayGridPlugin from '../daygrid/index'
import { PluginInput } from '../plugin-system-struct'
import { TimeGridView } from './components/TimeGridView'

export default {
  name: 'timegrid',
  initialView: 'timeGridWeek',
  deps: [dayGridPlugin],
  views: {
    timeGrid: {
      component: TimeGridView,
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
} as PluginInput
