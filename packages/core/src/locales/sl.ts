import { LocaleInput } from '../index.js'

export default {
  code: 'sl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: 'Prejšnji',
    next: 'Naslednji',
    today: 'Trenutni',
    year: 'Leto',
    month: 'Mesec',
    week: 'Teden',
    day: 'Dan',
    list: 'Dnevni red',
  },
  weekText: 'Teden',
  allDayText: 'Ves dan',
  moreLinkText: 'več',
  noEventsText: 'Ni dogodkov za prikaz',
} as LocaleInput
