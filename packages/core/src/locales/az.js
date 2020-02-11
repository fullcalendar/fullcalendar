
export default {
  code: "az",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: "Əvvəl",
    next: "Sonra",
    today: "Bu Gün",
    month: "Ay",
    week: "Həftə",
    day: "Gün",
    list: "Gündəm"
  },
  weekLabel: "Həftə",
  allDayText: "Bütün Gün",
  eventLimitText: function(n) {
    return "+ daha çox " + n;
  },
  noEventsMessage: "Göstərmək üçün hadisə yoxdur"
};
