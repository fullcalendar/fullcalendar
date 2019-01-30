import { createLocale } from '@fullcalendar/core';

export default createLocale("he", {
  dir: 'rtl',
  buttonText: {
    prev: "הקודם",
    next: "הבא",
    today: "היום",
    month: "חודש",
    week: "שבוע",
    day: "יום",
    list: "סדר יום"
  },
  allDayText: "כל היום",
  eventLimitText: "אחר",
  noEventsMessage: "אין אירועים להצגה",
  weekLabel: "שבוע"
});
