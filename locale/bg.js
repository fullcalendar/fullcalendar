
$.fullCalendar.locale("bg", {
	buttonText: {
		month: "Месец",
		week: "Седмица",
		day: "Ден",
		list: "График"
	},
	allDayText: "Цял ден",
	eventLimitText: function(n) {
		return "+още " + n;
	},
	noEventsMessage: "Няма събития за показване"
});
