
export default {
  code: "uk",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "Попередній",
    next: "далі",
    today: "Сьогодні",
    month: "Місяць",
    week: "Тиждень",
    day: "День",
    list: "Порядок денний"
  },
  weekLabel: "Тиж",
  allDayText: "Увесь день",
  eventLimitText: function(n) {
    return "+ще " + n + "...";
  },
  noEventsMessage: "Немає подій для відображення"
};
