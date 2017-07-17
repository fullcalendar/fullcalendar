
$.fullCalendar.locale("sr-cyrl", {
	buttonText: {
		prev: "Претходна",
		next: "следећи",
		month: "Месец",
		week: "Недеља",
		day: "Дан",
		list: "Планер"
	},
	allDayText: "Цео дан",
	eventLimitText: function(n) {
		return "+ још " + n;
	},
	noEventsMessage: "Нема догађаја за приказ"
});
