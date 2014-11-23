
$.fullCalendar.lang("zh-cn", {
	defaultButtonText: {
		month: "月",
		week: "周",
		day: "日",
		list: "日程"
	},
	allDayText: "全天",
	eventLimitText: function(n) {
		return "另外 " + n + " 个";
	}
});
