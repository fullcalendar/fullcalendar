
$.fullCalendar.lang("de", {
	defaultButtonText: {
		month: "Monat",
		week: "Woche",
		day: "Tag",
		list: "Terminübersicht"
	},
	allDayText: "Ganztägig",
	eventLimitText: function(n) {
		return "+ weitere " + n;
	}
});
