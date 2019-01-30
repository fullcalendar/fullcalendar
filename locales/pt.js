import { createLocale } from '@fullcalendar/core';

export default createLocale("pt", {
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prevText: "Anterior",
    nextText: "Seguinte",
    currentText: "Hoje",
    month: "Mês",
    week: "Semana",
    day: "Dia",
    list: "Agenda"
  },
  weekLabel: "Sem",
  allDayText: "Todo o dia",
  eventLimitText: "mais",
  noEventsMessage: "Não há eventos para mostrar"
});
