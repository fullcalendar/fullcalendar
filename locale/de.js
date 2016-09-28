
$.fullCalendar.locale("de", {
	buttonText: {
		month: "Monat",
		week: "Woche",
		day: "Tag",
		list: "Terminübersicht"
	},
	allDayText: "Ganztägig",
	eventLimitText: function(n) {
		return "+ weitere " + n;
	},
	noEventsMessage: "Keine Ereignisse anzuzeigen"
});
