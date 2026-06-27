import { LocaleInput } from '../datelib/locale'

export default {
  code: 'da',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Forrige',
  nextText: 'Næste',
  todayText: 'I dag',
  yearText: 'År',
  monthText: 'Måned',
  weekTextLong: 'Uge',
  dayText: 'Dag',
  listText: 'Agenda',
  allDayText: 'Hele\ndagen',
  moreLinkText: 'flere',
  noEventsText: 'Ingen arrangementer at vise',
} as LocaleInput
