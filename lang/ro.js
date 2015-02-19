
$.fullCalendar.lang("ro", {
	buttonText: {
		prev: "precedentă", // override JQUI's translations, which contains the word "month"
		next: "următoare",  // "
		month: "Lună",
		week: "Săptămână",
		day: "Zi",
		list: "Agendă"
	},
	allDayText: "Toată ziua",
	eventLimitText: function(n) {
		return "+alte " + n;
	}
});
