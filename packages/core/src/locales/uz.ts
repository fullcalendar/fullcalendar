import { LocaleInput } from '../index.js'

export default {
  code: 'uz',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Oldingi',
    next: 'Keyingi',
    today: 'Bugun',
    year: 'Yil',
    month: 'Oy',
    week: 'Xafta',
    day: 'Kun',
    list: 'Kun tartibi',
  },
  allDayText: 'Kun bo\'yi',
  moreLinkText(n) {
    return '+ yana ' + n
  },
  noEventsText: 'Ko\'rsatish uchun voqealar yo\'q',
} as LocaleInput
