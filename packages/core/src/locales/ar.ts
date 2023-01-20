import { LocaleInput } from '../index.js'

export default {
  code: 'ar',
  week: {
    dow: 6, // Saturday is the first day of the week.
    doy: 12, // The week that contains Jan 1st is the first week of the year.
  },
  direction: 'rtl',
  buttonText: {
    prev: 'السابق',
    next: 'التالي',
    today: 'اليوم',
    year: 'سنة',
    month: 'شهر',
    week: 'أسبوع',
    day: 'يوم',
    list: 'أجندة',
  },
  weekText: 'أسبوع',
  allDayText: 'اليوم كله',
  moreLinkText: 'أخرى',
  noEventsText: 'أي أحداث لعرض',
} as LocaleInput
