import { LocaleInput } from '../datelib/locale'

export default {
  code: 'it',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Prec',
  nextText: 'Succ',
  todayText: 'Oggi',
  yearText: 'Anno',
  monthText: 'Mese',
  weekTextLong: 'Settimana',
  weekTextShort: 'Sm',
  dayText: 'Giorno',
  listText: 'Agenda',
  allDayText: 'Tutto\nil giorno',
  moreLinkText(n) {
    return '+altri ' + n
  },
  noEventsText: 'Non ci sono eventi da visualizzare',
} as LocaleInput
