import { LocaleInput } from '../datelib/locale'

export default {
  code: 'tr',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'geri',
  nextText: 'ileri',
  todayText: 'bugün',
  yearText: 'Yıl',
  monthText: 'Ay',
  weekTextLong: 'Hafta',
  weekTextShort: 'Hf',
  dayText: 'Gün',
  listText: 'Ajanda',
  allDayText: 'Tüm gün',
  moreLinkText: 'daha fazla',
  noEventsText: 'Gösterilecek etkinlik yok',
} as LocaleInput
