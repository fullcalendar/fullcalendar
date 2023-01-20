import { LocaleInput } from '../index.js'

export default {
  code: 'fa',
  week: {
    dow: 6, // Saturday is the first day of the week.
    doy: 12, // The week that contains Jan 1st is the first week of the year.
  },
  direction: 'rtl',
  buttonText: {
    prev: 'قبلی',
    next: 'بعدی',
    today: 'امروز',
    year: 'سال',
    month: 'ماه',
    week: 'هفته',
    day: 'روز',
    list: 'برنامه',
  },
  weekText: 'هف',
  allDayText: 'تمام روز',
  moreLinkText(n) {
    return 'بیش از ' + n
  },
  noEventsText: 'هیچ رویدادی به نمایش',
} as LocaleInput
