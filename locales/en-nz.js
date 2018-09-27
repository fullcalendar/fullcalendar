import { defineLocale } from 'fullcalendar';

defineLocale("en-nz", {
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  }
});
