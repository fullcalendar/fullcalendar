
export default {
  code: "sk",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: "Predchádzajúci",
    next: "Nasledujúci",
    today: "Dnes",
    month: "Mesiac",
    week: "Týždeň",
    day: "Deň",
    list: "Rozvrh"
  },
  weekLabel: "Ty",
  allDayText: "Celý deň",
  eventLimitText: function(n) {
    return "+ďalšie: " + n;
  },
  noEventsMessage: "Žiadne akcie na zobrazenie"
};
