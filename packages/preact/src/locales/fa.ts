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
  prevYearText: 'سال قبل',
  nextYearText: 'سال بعد',
  todayText: 'امروز',
  yearText: 'سال',
  monthText: 'ماه',
  weekTextLong: 'هفته',
  weekTextShort: 'هف',
  dayText: 'روز',
  listText: 'برنامه',
  allDayText: 'تمام روز',
  moreLinkText(n) {
    return '+' + n + ' بیشتر'
  },
  noEventsText: 'هیچ رویدادی برای نمایش یافت نشد',
  prevHint: '$0 قبلی',
  nextHint: '$0 بعدی',
  todayHint(unitText, unit) {
    // → امروز, این هفته, این ماه, امسال
    if (unit === 'day') {
      return 'امروز'
    }
    if (unit === 'year') {
      return 'امسال'
    }
    return `این ${unitText || 'دوره'}`
  },
  viewHint: 'مشاهده $0',
  navLinkHint: 'برو به $0',
  closeHint: 'بستن',
  eventsHint: 'رویدادها',
} as LocaleInput
