import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'eu',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: 'Aur',
    next: 'Hur',
    today: 'Gaur',
    month: 'Hilabetea',
    week: 'Astea',
    day: 'Eguna',
    list: 'Agenda',
  },
  weekText: 'As',
  allDayText: 'Egun osoa',
  moreLinkText: 'gehiago',
  noEventsText: 'Ez dago ekitaldirik erakusteko',
} as LocaleInput
