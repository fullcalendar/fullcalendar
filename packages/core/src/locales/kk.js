
export default {
  code: "kk",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "Алдыңғы",
    next: "Келесі",
    today: "Бүгін",
    month: "Ай",
    week: "Апта",
    day: "Күн",
    list: "Күн тәртібі"
  },
  weekLabel: "Не",
  allDayText: "Күні бойы",
  eventLimitText: function(n) {
    return "+ тағы " + n;
  },
  noEventsMessage: "Көрсету үшін оқиғалар жоқ"
};
