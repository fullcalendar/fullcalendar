import { LocaleInput } from '../datelib/locale'

export default {
  code: 'uk',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Попередній',
  nextText: 'далі',
  todayText: 'Сьогодні',
  yearText: 'рік',
  monthText: 'Місяць',
  weekTextLong: 'Тиждень',
  weekTextShort: 'Тиж',
  dayText: 'День',
  listText: 'Порядок денний',
  allDayText: 'Увесь\nдень',
  moreLinkText(n) {
    return '+ще ' + n + '...'
  },
  noEventsText: 'Немає подій для відображення',
} as LocaleInput
