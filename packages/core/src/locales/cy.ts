import { LocaleInput } from '../index.js'

export default {
  code: 'cy',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Blaenorol',
    next: 'Nesaf',
    today: 'Heddiw',
    year: 'Blwyddyn',
    month: 'Mis',
    week: 'Wythnos',
    day: 'Dydd',
    list: 'Rhestr',
  },
  weekText: 'Wythnos',
  allDayText: 'Trwy\'r dydd',
  moreLinkText: 'Mwy',
  noEventsText: 'Dim digwyddiadau',
} as LocaleInput
