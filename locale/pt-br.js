
$.fullCalendar.locale("pt-br", {
	buttonText: {
		today: "Hoje",
		month: "Mês",
		week: "Semana",
		day: "Dia",
		list: "Lista"
	},
	allDayText: "dia inteiro",
	eventLimitText: function(n) {
		return "mais +" + n;
	},
	dayNames:['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
	dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
    	monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    	monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
	noEventsMessage: "Não há eventos para mostrar"
});
