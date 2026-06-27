import { LocaleInput } from '../datelib/locale'

export default {
  code: 'bn',
  week: {
    dow: 0, // Sunday is the first day of the week.
    doy: 6, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'পেছনে',
  nextText: 'সামনে',
  todayText: 'আজ',
  yearText: 'বছর',
  monthText: 'মাস',
  weekTextLong: 'সপ্তাহ',
  dayText: 'দিন',
  listText: 'তালিকা',
  allDayText: 'সারাদিন',
  moreLinkText(n) {
    return '+অন্যান্য ' + n
  },
  noEventsText: 'কোনো ইভেন্ট নেই',
} as LocaleInput
