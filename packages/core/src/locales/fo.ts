import { LocaleInput } from '../index.js'

export default {
  code: 'fo',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Fyrri',
    next: 'Næsti',
    today: 'Í dag',
    year: 'Ár',
    month: 'Mánaður',
    week: 'Vika',
    day: 'Dagur',
    list: 'Listi',
  },
  weekText: 'Vika',
  allDayText: 'Allan dagin',
  moreLinkText: 'meira',
  noEventsText: 'Eingin tiltøk',
} as LocaleInput
