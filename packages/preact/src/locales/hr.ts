import { LocaleInput } from '../datelib/locale'

export default {
  code: 'hr',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Prijašnji',
  nextText: 'Sljedeći',
  todayText: 'Danas',
  yearText: 'Godina',
  monthText: 'Mjesec',
  weekTextLong: 'Tjedan',
  weekTextShort: 'Tje',
  dayText: 'Dan',
  listText: 'Raspored',
  allDayText: 'Cijeli\ndan',
  moreLinkText(n) {
    return '+ još ' + n
  },
  noEventsText: 'Nema događaja za prikaz',
} as LocaleInput
