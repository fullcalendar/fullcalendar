import * as FullCalendar from 'fullcalendar';

FullCalendar.locale("ar-ly", {
  week: {
    dow: 6, // Saturday is the first day of the week.
    doy: 12  // The week that contains Jan 1st is the first week of the year.
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
