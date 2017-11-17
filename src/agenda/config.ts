import { register } from '../ViewRegistry'
import AgendaView from './AgendaView'

register('agenda', {
	'class': AgendaView,
	defaults: {
		allDaySlot: true,
		slotDuration: '00:30:00',
		slotEventOverlap: true // a bad name. confused with overlap/constraint system
	}
});

register('agendaDay', {
	type: 'agenda',
	duration: { days: 1 }
});

register('agendaWeek', {
	type: 'agenda',
	duration: { weeks: 1 }
});
