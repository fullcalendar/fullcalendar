import { LocaleInput } from '../datelib/locale'

export default {
  code: 'sk',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Predchádzajúci',
  nextText: 'Nasledujúci',
  todayText: 'Dnes',
  yearText: 'Rok',
  monthText: 'Mesiac',
  weekTextLong: 'Týždeň',
  weekTextShort: 'Ty',
  dayText: 'Deň',
  listText: 'Rozvrh',
  allDayText: 'Celý deň',
  moreLinkText(n) {
    return '+ďalšie: ' + n
  },
  noEventsText: 'Žiadne akcie na zobrazenie',
} as LocaleInput
