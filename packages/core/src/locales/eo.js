
export default {
  code: "eo",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: "Antaŭa",
    next: "Sekva",
    today: "Hodiaŭ",
    month: "Monato",
    week: "Semajno",
    day: "Tago",
    list: "Tagordo"
  },
  weekLabel: "Sm",
  allDayText: "Tuta semajno",
  eventLimitText: function(n) {
    return "+pliaj: " + n;
  },
  noEventsMessage: "Neniu okazaĵo por montri"
};
