
$.fullCalendar.locale("hi", {
	buttonText: {
		month: "महीना",
		week: "सप्ताह",
		day: "दिन",
		list: "कार्यसूची"
	},
	allDayText: "सभी दिन",
	eventLimitText: function(n) {
		return "+अधिक " + n;
	},
	noEventsMessage: "कोई घटनाओं को प्रदर्शित करने के लिए"
});
