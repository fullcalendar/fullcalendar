
$.fullCalendar.locale("lv", {
	buttonText: {
		month: "Mēnesis",
		week: "Nedēļa",
		day: "Diena",
		list: "Dienas kārtība"
	},
	allDayText: "Visu dienu",
	eventLimitText: function(n) {
		return "+vēl " + n;
	},
	noEventsMessage: "Nav notikumu"
});
