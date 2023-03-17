import { LocaleInput } from '../index.js'

export default {
  code: 'it',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Prec',
    next: 'Succ',
    today: 'Oggi',
    year: 'Anno',
    month: 'Mese',
    week: 'Settimana',
    day: 'Giorno',
    list: 'Agenda',
  },
  weekText: 'Sm',
  allDayText: 'Tutto il giorno',
  moreLinkText(n) {
    return '+altri ' + n
  },
  noEventsText: 'Non ci sono eventi da visualizzare',
} as LocaleInput
