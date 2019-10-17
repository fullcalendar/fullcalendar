
export default {
  code: "sr",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "Prethodna",
    next: "Sledeći",
    today: "Danas",
    month: "Mеsеc",
    week: "Nеdеlja",
    day: "Dan",
    list: "Planеr"
  },
  weekLabel: "Sed",
  allDayText: "Cеo dan",
  eventLimitText: function(n) {
    return "+ još " + n;
  },
  noEventsMessage: "Nеma događaja za prikaz"
};
