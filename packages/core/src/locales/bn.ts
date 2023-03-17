import { LocaleInput } from '../index.js'

export default {
  code: 'bn',
  week: {
    dow: 0, // Sunday is the first day of the week.
    doy: 6, // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: 'পেছনে',
    next: 'সামনে',
    today: 'আজ',
    year: 'বছর',
    month: 'মাস',
    week: 'সপ্তাহ',
    day: 'দিন',
    list: 'তালিকা',
  },
  weekText: 'সপ্তাহ',
  allDayText: 'সারাদিন',
  moreLinkText(n) {
    return '+অন্যান্য ' + n
  },
  noEventsText: 'কোনো ইভেন্ট নেই',
} as LocaleInput
