import { LocaleInput } from '../datelib/locale'

export default {
  code: 'sr-cyrl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Претходна',
  nextText: 'следећи',
  todayText: 'Данас',
  yearText: 'Година',
  monthText: 'Месец',
  weekTextLong: 'Недеља',
  weekTextShort: 'Сед',
  dayText: 'Дан',
  listText: 'Планер',
  allDayText: 'Цео дан',
  moreLinkText(n) {
    return '+ још ' + n
  },
  noEventsText: 'Нема догађаја за приказ',
} as LocaleInput
