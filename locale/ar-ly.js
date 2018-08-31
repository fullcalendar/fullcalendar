import { defineLocale } from 'fullcalendar';

defineLocale("ar-ly", {
  week: {
    dow: 6, // Saturday is the first day of the week.
    doy: 12  // The week that contains Jan 1st is the first week of the year.
  },
  isRtl: true,
  buttonText: {
    prev: "السابق",
    next: "التالي",
    today: "اليوم",
    month: "شهر",
    week: "أسبوع",
    day: "يوم",
    list: "أجندة"
  },
  weekLabel: "أسبوع",
  allDayText: "اليوم كله",
  eventLimitText: "أخرى",
  noEventsMessage: "أي أحداث لعرض"
});
