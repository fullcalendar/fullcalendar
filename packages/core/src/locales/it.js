
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
  weekText: "Sm",
  allDayHtml: "Tutto il<br/>giorno",
  moreLinkText: function(n) {
    return "+altri " + n;
  },
  noEventsContent: "Non ci sono eventi da visualizzare"
};
