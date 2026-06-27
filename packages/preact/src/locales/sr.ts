import { LocaleInput } from '../datelib/locale'

export default {
  code: 'sr',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Prethodna',
  nextText: 'Sledeći',
  todayText: 'Danas',
  yearText: 'Godina',
  monthText: 'Mеsеc',
  weekTextLong: 'Nеdеlja',
  weekTextShort: 'Sed',
  dayText: 'Dan',
  listText: 'Planеr',
  allDayText: 'Cеo dan',
  moreLinkText(n) {
    return '+ još ' + n
  },
  noEventsText: 'Nеma događaja za prikaz',
} as LocaleInput
