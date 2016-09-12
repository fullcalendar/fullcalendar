
$.fullCalendar.locale("vi", {
	buttonText: {
		month: "Tháng",
		week: "Tuần",
		day: "Ngày",
		list: "Lịch biểu"
	},
	allDayText: "Cả ngày",
	eventLimitText: function(n) {
		return "+ thêm " + n;
	},
	noEventsMessage: "Không có sự kiện để hiển thị"
});
