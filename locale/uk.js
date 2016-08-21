
$.fullCalendar.locale("uk", {
	buttonText: {
		month: "Місяць",
		week: "Тиждень",
		day: "День",
		list: "Порядок денний"
	},
	allDayText: "Увесь день",
	eventLimitText: function(n) {
		return "+ще " + n + "...";
	},
	noEventsMessage: "Немає подій для відображення"
});
