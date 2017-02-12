
$.fullCalendar.locale("hr", {
	buttonText: {
		prev: "Prijašnji", // jqui datepicker has weird html entities. override.
		next: "Sljedeći", // "
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
