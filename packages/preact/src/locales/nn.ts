import { LocaleInput } from '../datelib/locale'

export default {
  code: 'nn',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Førre',
  nextText: 'Neste',
  todayText: 'I dag',
  yearText: 'År',
  monthText: 'Månad',
  weekTextLong: 'Veke',
  dayText: 'Dag',
  listText: 'Agenda',
  allDayText: 'Heile\ndagen',
  moreLinkText: 'til',
  noEventsText: 'Ingen hendelser å vise',
} as LocaleInput
