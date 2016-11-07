
$.fullCalendar.locale("it", {
	buttonText: {
		month: "Mese",
		week: "Settimana",
		day: "Giorno",
		list: "Agenda"
	},
	allDayHtml: "Tutto il<br/>giorno",
	eventLimitText: function(n) {
		return "+altri " + n;
	},
	noEventsMessage: "Non ci sono eventi da visualizzare"
});
