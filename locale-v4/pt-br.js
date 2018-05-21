import * as FullCalendar from 'fullcalendar';

FullCalendar.locale("pt-br", {
  buttonText: {
    prevText: "Anterior",
    nextText: "Próximo",
    currentText: "Hoje",
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
