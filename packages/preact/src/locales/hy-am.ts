import { LocaleInput } from '../datelib/locale'

export default {
  code: 'hy-am',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Նախորդ',
  nextText: 'Հաջորդ',
  todayText: 'Այսօր',
  yearText: 'Տարի',
  monthText: 'Ամիս',
  weekTextLong: 'Շաբաթ',
  weekTextShort: 'Շաբ',
  dayText: 'Օր',
  listText: 'Օրվա ցուցակ',
  allDayText: 'Ամբողջ օր',
  moreLinkText(n) {
    return '+ ևս ' + n
  },
  noEventsText: 'Բացակայում է իրադարձությունը ցուցադրելու',
} as LocaleInput
