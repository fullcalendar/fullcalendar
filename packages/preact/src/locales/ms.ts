import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ms',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Sebelum',
  nextText: 'Selepas',
  todayText: 'hari ini',
  yearText: 'Tahun',
  monthText: 'Bulan',
  weekTextLong: 'Minggu',
  weekTextShort: 'Mg',
  dayText: 'Hari',
  listText: 'Agenda',
  allDayText: 'Sepanjang\nhari',
  moreLinkText(n) {
    return 'masih ada ' + n + ' acara'
  },
  noEventsText: 'Tiada peristiwa untuk dipaparkan',
} as LocaleInput
