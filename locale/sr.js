
$.fullCalendar.locale("sr", {
	buttonText: {
		prev: "Prethodna",
		next: "Sledeći",
		month: "Mеsеc",
		week: "Nеdеlja",
		day: "Dan",
		list: "Planеr"
	},
	allDayText: "Cеo dan",
	eventLimitText: function(n) {
		return "+ još " + n;
	},
	noEventsMessage: "Nеma događaja za prikaz"
});
