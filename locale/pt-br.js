
$.fullCalendar.locale("pt-br", {
	buttonText: {
		month: "Mês",
		week: "Semana",
		day: "Dia",
		list: "Compromissos"
	},
	allDayText: "dia inteiro",
	eventLimitText: function(n) {
		return "mais +" + n;
	},
	noEventsMessage: "Não há eventos para mostrar"
});
