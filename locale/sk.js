
$.fullCalendar.locale("sk", {
	buttonText: {
		month: "Mesiac",
		week: "Týždeň",
		day: "Deň",
		list: "Rozvrh"
	},
	allDayText: "Celý deň",
	eventLimitText: function(n) {
		return "+ďalšie: " + n;
	},
	noEventsMessage: "Žiadne akcie na zobrazenie"
});
