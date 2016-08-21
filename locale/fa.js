
$.fullCalendar.locale("fa", {
	buttonText: {
		month: "ماه",
		week: "هفته",
		day: "روز",
		list: "برنامه"
	},
	allDayText: "تمام روز",
	eventLimitText: function(n) {
		return "بیش از " + n;
	},
	noEventsMessage: "هیچ رویدادی به نمایش"
});
