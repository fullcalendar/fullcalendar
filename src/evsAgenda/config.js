

fcViews.evsAgenda = {
	'class': EVSAgendaView,
	defaults: {
		allDaySlot: true,
		allDayText: 'all-day',
		slotDuration: '00:30:00',
		minTime: '00:00:00',
		maxTime: '24:00:00',
		slotEventOverlap: true // a bad name. confused with overlap/constraint system
	}
};

fcViews.evsAgendaDay = {
	type: 'evsAgenda',
	duration: { days: 1 }
};