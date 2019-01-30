
export default {
  code: "hr",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "Prijašnji",
    next: "Sljedeći",
    today: "Danas",
    month: "Mjesec",
    week: "Tjedan",
    day: "Dan",
    list: "Raspored"
  },
  weekLabel: "Tje",
  allDayText: "Cijeli dan",
  eventLimitText: function(n) {
    return "+ još " + n;
  },
  noEventsMessage: "Nema događaja za prikaz"
};
