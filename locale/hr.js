
$.fullCalendar.locale("hr", {
	buttonText: {
		month: "Mjesec",
		week: "Tjedan",
		day: "Dan",
		list: "Raspored"
	},
	allDayText: "Cijeli dan",
	eventLimitText: function(n) {
		return "+ još " + n;
	},
	noEventsMessage: "Nema događaja za prikaz"
});
