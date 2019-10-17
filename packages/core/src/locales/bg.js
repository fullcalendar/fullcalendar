
export default {
  code: "bg",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "назад",
    next: "напред",
    today: "днес",
    month: "Месец",
    week: "Седмица",
    day: "Ден",
    list: "График"
  },
  allDayText: "Цял ден",
  eventLimitText: function(n) {
    return "+още " + n;
  },
  noEventsMessage: "Няма събития за показване"
};
