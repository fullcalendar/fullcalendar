
export default {
  code: "ms",
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7  // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "Sebelum",
    next: "Selepas",
    today: "hari ini",
    month: "Bulan",
    week: "Minggu",
    day: "Hari",
    list: "Agenda"
  },
  weekLabel: "Mg",
  allDayText: "Sepanjang hari",
  eventLimitText: function(n) {
    return "masih ada " + n + " acara";
  },
  noEventsMessage: "Tiada peristiwa untuk dipaparkan"
};
