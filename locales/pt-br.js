import { createLocale } from '@fullcalendar/core';

export default createLocale("pt-br", {
  buttonText: {
    prevText: "Anterior",
    nextText: "Próximo",
    currentText: "Hoje",
    month: "Mês",
    week: "Semana",
    day: "Dia",
    list: "Compromissos"
  },
  weekLabel: "Sm",
  allDayText: "dia inteiro",
  eventLimitText: function(n) {
    return "mais +" + n;
  },
  noEventsMessage: "Não há eventos para mostrar"
});
