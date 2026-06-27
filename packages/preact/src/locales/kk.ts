import { LocaleInput } from '../datelib/locale'

export default {
  code: 'kk',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Алдыңғы',
  nextText: 'Келесі',
  todayText: 'Бүгін',
  yearText: 'Жыл',
  monthText: 'Ай',
  weekTextLong: 'Апта',
  dayText: 'Күн',
  listText: 'Күн тәртібі',
  allDayText: 'Күні\nбойы',
  moreLinkText(n) {
    return '+ тағы ' + n
  },
  noEventsText: 'Көрсету үшін оқиғалар жоқ',
} as LocaleInput
