import { LocaleInput } from '../index.js'

export default {
  code: 'sr-cyrl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: 'Претходна',
    next: 'следећи',
    today: 'Данас',
    year: 'Година',
    month: 'Месец',
    week: 'Недеља',
    day: 'Дан',
    list: 'Планер',
  },
  weekText: 'Сед',
  allDayText: 'Цео дан',
  moreLinkText(n) {
    return '+ још ' + n
  },
  noEventsText: 'Нема догађаја за приказ',
} as LocaleInput
