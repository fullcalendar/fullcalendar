import { LocaleInput } from '../datelib/locale'

export default {
  code: 'hu',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Vissza',
  nextText: 'Előre',
  todayText: 'Ma',
  yearText: 'Év',
  monthText: 'Hónap',
  weekTextLong: 'Hét',
  dayText: 'Nap',
  listText: 'Lista',
  allDayText: 'Egész\nnap',
  moreLinkText: 'további',
  noEventsText: 'Nincs megjeleníthető esemény',
} as LocaleInput
