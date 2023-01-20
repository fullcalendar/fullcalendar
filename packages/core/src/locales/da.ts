import { LocaleInput } from '../index.js'

export default {
  code: 'da',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Forrige',
    next: 'Næste',
    today: 'I dag',
    year: 'År',
    month: 'Måned',
    week: 'Uge',
    day: 'Dag',
    list: 'Agenda',
  },
  weekText: 'Uge',
  allDayText: 'Hele dagen',
  moreLinkText: 'flere',
  noEventsText: 'Ingen arrangementer at vise',
} as LocaleInput
