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
    prevYear: 'پارسال',
    nextYear: 'سال آینده',
    today: 'امروز',
    year: 'سال',
    month: 'ماه',
    week: 'هفته',
    day: 'روز',
    list: 'برنامه',
  },
  weekText: 'هف',
  weekTextLong: 'هفته',
  closeHint: 'نزدیک',
  timeHint: 'زمان',
  eventHint: 'رویداد',
  allDayText: 'تمام روز',
  moreLinkText(n) {
    return 'بیش از ' + n
  },
  noEventsText: 'هیچ رویدادی برای نمایش موجود نمی‌باشد',
  buttonHints: {
    prev: '$0 قبلی',
    next: '$0 بعدی',
    today(buttonText, unit) {
      return (unit === 'day')
        ? 'امروز'
        : `${buttonText}این `
    },
  },
  viewHint: 'مشاهده $0',
  navLinkHint: 'برو به $0',
} as LocaleInput
