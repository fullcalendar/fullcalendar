import { LocaleInput } from '../datelib/locale'

export default {
  code: 'bg',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'назад',
  nextText: 'напред',
  todayText: 'днес',
  yearText: 'година',
  monthText: 'Месец',
  weekTextLong: 'Седмица',
  dayText: 'Ден',
  listText: 'График',
  allDayText: 'Цял ден',
  moreLinkText(n) {
    return '+още ' + n
  },
  noEventsText: 'Няма събития за показване',
} as LocaleInput
