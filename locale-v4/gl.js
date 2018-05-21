import * as FullCalendar from 'fullcalendar';

FullCalendar.locale("gl", {
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prevText: "Ant",
    nextText: "Seg",
    currentText: "Hoxe",
    month: "Mes",
    week: "Semana",
    day: "Día",
    list: "Axenda"
  },
  allDayHtml: "Todo<br/>o día",
  eventLimitText: "máis",
  noEventsMessage: "Non hai eventos para amosar"
});
