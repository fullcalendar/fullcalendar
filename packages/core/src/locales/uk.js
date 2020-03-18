
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
  weekText: "Тиж",
  allDayContent: "Увесь день",
  moreLinkText: function(n) {
    return "+ще " + n + "...";
  },
  noEventsContent: "Немає подій для відображення"
};
