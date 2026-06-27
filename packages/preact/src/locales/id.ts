import { LocaleInput } from '../datelib/locale'

export default {
  code: 'id',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'mundur',
  nextText: 'maju',
  todayText: 'hari ini',
  yearText: 'Tahun',
  monthText: 'Bulan',
  weekTextLong: 'Minggu',
  weekTextShort: 'Mg',
  dayText: 'Hari',
  listText: 'Agenda',
  allDayText: 'Sehari\npenuh',
  moreLinkText: 'lebih',
  noEventsText: 'Tidak ada acara untuk ditampilkan',
} as LocaleInput
