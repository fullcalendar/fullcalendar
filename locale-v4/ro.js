import * as FullCalendar from 'fullcalendar';

FullCalendar.locale("ro", {
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "precedentă",
    next: "următoare",
    today: "Azi",
    month: "Lună",
    week: "Săptămână",
    day: "Zi",
    list: "Agendă"
  },
  allDayText: "Toată ziua",
  eventLimitText: function(n) {
    return "+alte " + n;
  },
  noEventsMessage: "Nu există evenimente de afișat"
});
