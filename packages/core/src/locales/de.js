
export default {
  code: "de",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: "Zurück",
    next: "Vor",
    today: "Heute",
    year: "Jahr",
    month: "Monat",
    week: "Woche",
    day: "Tag",
    list: "Terminübersicht"
  },
  weekText: "KW",
  allDayContent: "Ganztägig",
  moreLinkText: function(n) {
    return "+ weitere " + n;
  },
  noEventsContent: "Keine Ereignisse anzuzeigen"
};
