import { createPlugin } from '../plugin-system'
import AgendaView from './AgendaView'

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
