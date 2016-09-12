
$.fullCalendar.locale("ru", {
	buttonText: {
		month: "Месяц",
		week: "Неделя",
		day: "День",
		list: "Повестка дня"
	},
	allDayText: "Весь день",
	eventLimitText: function(n) {
		return "+ ещё " + n;
	},
	noEventsMessage: "Нет событий для отображения"
});
