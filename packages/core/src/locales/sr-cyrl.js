
export default {
  code: "sr-cyrl",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "Претходна",
    next: "следећи",
    today: "Данас",
    month: "Месец",
    week: "Недеља",
    day: "Дан",
    list: "Планер"
  },
  weekLabel: "Сед",
  allDayText: "Цео дан",
  eventLimitText: function(n) {
    return "+ још " + n;
  },
  noEventsMessage: "Нема догађаја за приказ"
};
