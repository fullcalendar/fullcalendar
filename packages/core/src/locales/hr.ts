import { LocaleInput } from '../index.js'

export default {
  code: 'hr',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: 'Prijašnji',
    next: 'Sljedeći',
    today: 'Danas',
    year: 'Godina',
    month: 'Mjesec',
    week: 'Tjedan',
    day: 'Dan',
    list: 'Raspored',
  },
  weekText: 'Tje',
  allDayText: 'Cijeli dan',
  moreLinkText(n) {
    return '+ još ' + n
  },
  noEventsText: 'Nema događaja za prikaz',
} as LocaleInput
