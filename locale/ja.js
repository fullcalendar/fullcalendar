
$.fullCalendar.locale("ja", {
	buttonText: {
		month: "月",
		week: "週",
		day: "日",
		list: "予定リスト"
	},
	allDayText: "終日",
	eventLimitText: function(n) {
		return "他 " + n + " 件";
	},
	noEventsMessage: "イベントが表示されないように"
});
