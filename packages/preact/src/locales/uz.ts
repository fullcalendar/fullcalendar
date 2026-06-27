import { LocaleInput } from '../datelib/locale'

export default {
  code: 'uz',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Oldingi',
  nextText: 'Keyingi',
  todayText: 'Bugun',
  yearText: 'Yil',
  monthText: 'Oy',
  weekTextLong: 'Xafta',
  dayText: 'Kun',
  listText: 'Kun tartibi',
  allDayText: 'Kun bo\'yi',
  moreLinkText(n) {
    return '+ yana ' + n
  },
  noEventsText: 'Ko\'rsatish uchun voqealar yo\'q',
} as LocaleInput
