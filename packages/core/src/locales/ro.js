
export default {
  code: "ro",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "precedentă",
    next: "următoare",
    today: "Azi",
    month: "Lună",
    week: "Săptămână",
    day: "Zi",
    list: "Agendă"
  },
  weekText: "Săpt",
  allDayContent: "Toată ziua",
  moreLinkText: function(n) {
    return "+alte " + n;
  },
  noEventsContent: "Nu există evenimente de afișat"
};
