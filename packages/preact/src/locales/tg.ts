import { LocaleInput } from '../datelib/locale'

export default {
  code: 'tg',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Қаблӣ',
  nextText: 'Баъдӣ',
  todayText: 'Имрӯз',
  yearText: 'Сол',
  monthText: 'Моҳ',
  weekTextLong: 'Ҳафта',
  dayText: 'Рӯз',
  listText: 'Рӯйхат',
  allDayText: 'Тамоми рӯз',
  moreLinkText(n) {
    return '+ бештар ' + n
  },
  noEventsText: 'Ҳеҷ рӯйдоде барои намоиш нест',
  closeHint: 'Пӯшидан',
  eventsHint: 'Рӯйдодҳо',
} as LocaleInput
