import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'lt',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Atgal',
    next: 'Pirmyn',
    today: 'Šiandien',
    month: 'Mėnuo',
    week: 'Savaitė',
    day: 'Diena',
    list: 'Darbotvarkė',
  },
  weekText: 'SAV',
  allDayText: 'Visą dieną',
  moreLinkText: 'daugiau',
  noEventsText: 'Nėra įvykių rodyti',
} as LocaleInput
