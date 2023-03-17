import { LocaleInput } from '../index.js'

export default {
  code: 'sk',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Predchádzajúci',
    next: 'Nasledujúci',
    today: 'Dnes',
    year: 'Rok',
    month: 'Mesiac',
    week: 'Týždeň',
    day: 'Deň',
    list: 'Rozvrh',
  },
  weekText: 'Ty',
  allDayText: 'Celý deň',
  moreLinkText(n) {
    return '+ďalšie: ' + n
  },
  noEventsText: 'Žiadne akcie na zobrazenie',
} as LocaleInput
