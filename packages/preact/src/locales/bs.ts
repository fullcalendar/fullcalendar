import { LocaleInput } from '../datelib/locale'

export default {
  code: 'bs',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Prošli',
  nextText: 'Sljedeći',
  todayText: 'Danas',
  yearText: 'Godina',
  monthText: 'Mjesec',
  weekTextLong: 'Sedmica',
  weekTextShort: 'Sed',
  dayText: 'Dan',
  listText: 'Raspored',
  allDayText: 'Cijeli\ndan',
  moreLinkText(n) {
    return '+ još ' + n
  },
  noEventsText: 'Nema događaja za prikazivanje',
} as LocaleInput
