import * as FullCalendar from 'fullcalendar';

FullCalendar.locale("ar-dz", {
  week: {
    dow: 0, // Sunday is the first day of the week.
    doy: 4  // The week that contains Jan 1st is the first week of the year.
  },
  isRTL: true,
  buttonText: {
    prev: "السابق",
    next: "التالي",
    today: "اليوم",
    month: "شهر",
    week: "أسبوع",
    day: "يوم",
    list: "أجندة"
  },
  allDayText: "اليوم كله",
  eventLimitText: "أخرى",
  noEventsMessage: "أي أحداث لعرض"
});
