import * as FullCalendar from 'fullcalendar';

FullCalendar.locale("is", {
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: "Fyrri",
    next: "Næsti",
    today: "Í dag",
    month: "Mánuður",
    week: "Vika",
    day: "Dagur",
    list: "Dagskrá"
  },
  allDayHtml: "Allan<br/>daginn",
  eventLimitText: "meira",
  noEventsMessage: "Engir viðburðir til að sýna"
});
