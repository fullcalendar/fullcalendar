import { defineView } from '../ViewRegistry'
import AgendaView from './AgendaView'

defineView('agenda', {
  'class': AgendaView,
  defaults: {
    allDaySlot: true,
    slotDuration: '00:30:00',
    slotEventOverlap: true // a bad name. confused with overlap/constraint system
  }
})

defineView('agendaDay', {
  type: 'agenda',
  duration: { days: 1 }
})

defineView('agendaWeek', {
  type: 'agenda',
  duration: { weeks: 1 }
})
