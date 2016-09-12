
$.fullCalendar.locale("ms", {
	buttonText: {
		month: "Bulan",
		week: "Minggu",
		day: "Hari",
		list: "Agenda"
	},
	allDayText: "Sepanjang hari",
	eventLimitText: function(n) {
		return "masih ada " + n + " acara";
	},
	noEventsMessage: "Tiada peristiwa untuk dipaparkan"
});
