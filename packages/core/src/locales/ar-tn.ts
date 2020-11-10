import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'ar-tn',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  direction: 'rtl',
  buttonText: {
    prev: 'السابق',
    next: 'التالي',
    today: 'اليوم',
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
