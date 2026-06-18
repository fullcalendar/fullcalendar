import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ar-ly',
  week: {
    dow: 6, // Saturday is the first day of the week.
    doy: 12, // The week that contains Jan 1st is the first week of the year.
  },
  direction: 'rtl',
  prevText: 'السابق',
  nextText: 'التالي',
  todayText: 'اليوم',
  yearText: 'سنة',
  monthText: 'شهر',
  weekTextLong: 'أسبوع',
  dayText: 'يوم',
  listText: 'أجندة',
  allDayText: 'اليوم كله',
  moreLinkText: 'أخرى',
  noEventsText: 'أي أحداث لعرض',
} as LocaleInput
