import namespaceHooks from '../namespace-hooks'
import AgendaView from './AgendaView'

const views = namespaceHooks.views as any

views.agenda = {
	'class': AgendaView,
	defaults: {
		allDaySlot: true,
		slotDuration: '00:30:00',
		slotEventOverlap: true // a bad name. confused with overlap/constraint system
	}
};

views.agendaDay = {
	type: 'agenda',
	duration: { days: 1 }
};

views.agendaWeek = {
	type: 'agenda',
	duration: { weeks: 1 }
};
