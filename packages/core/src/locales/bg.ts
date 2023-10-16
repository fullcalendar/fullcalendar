import { LocaleInput } from '../index.js'

export default {
  code: 'bg',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'назад',
    next: 'напред',
    today: 'днес',
    year: 'година',
    month: 'Месец',
    week: 'Седмица',
    day: 'Ден',
    list: 'График',
  },
  allDayText: 'Цял ден',
  moreLinkText(n) {
    return '+още ' + n
  },
  noEventsText: 'Няма събития за показване',
} as LocaleInput
