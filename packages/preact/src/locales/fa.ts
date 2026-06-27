import { LocaleInput } from '../datelib/locale'

export default {
  code: 'fa',
  week: {
    dow: 6, // Saturday is the first day of the week.
    doy: 12, // The week that contains Jan 1st is the first week of the year.
  },
  direction: 'rtl',
  prevText: 'قبلی',
  nextText: 'بعدی',
  todayText: 'امروز',
  yearText: 'سال',
  monthText: 'ماه',
  weekTextLong: 'هفته',
  weekTextShort: 'هف',
  dayText: 'روز',
  listText: 'برنامه',
  allDayText: 'تمام روز',
  moreLinkText(n) {
    return 'بیش از ' + n
  },
  noEventsText: 'هیچ رویدادی به نمایش',
} as LocaleInput
