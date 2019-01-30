
export default {
  code: "it",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: "Prec",
    next: "Succ",
    today: "Oggi",
    month: "Mese",
    week: "Settimana",
    day: "Giorno",
    list: "Agenda"
  },
  weekLabel: "Sm",
  allDayHtml: "Tutto il<br/>giorno",
  eventLimitText: function(n) {
    return "+altri " + n;
  },
  noEventsMessage: "Non ci sono eventi da visualizzare"
};
