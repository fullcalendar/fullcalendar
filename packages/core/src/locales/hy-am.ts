import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'hy-am',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Նախորդ',
    next: 'Հաջորդ',
    today: 'Այսօր',
    month: 'Ամիս',
    week: 'Շաբաթ',
    day: 'Օր',
    list: 'Օրվա ցուցակ',
  },
  weekText: 'Շաբ',
  allDayText: 'Ամբողջ օր',
  moreLinkText(n) {
    return '+ ևս ' + n
  },
  noEventsText: 'Բացակայում է իրադարձությունը ցուցադրելու',
} as LocaleInput
