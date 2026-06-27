import { LocaleInput } from '../datelib/locale'

export default {
  code: 'nb',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Forrige',
  nextText: 'Neste',
  todayText: 'I dag',
  yearText: 'År',
  monthText: 'Måned',
  weekTextLong: 'Uke',
  dayText: 'Dag',
  listText: 'Agenda',
  allDayText: 'Hele\ndagen',
  moreLinkText: 'til',
  noEventsText: 'Ingen hendelser å vise',
  prevHint: 'Forrige $0',
  nextHint: 'Neste $0',
  todayHint: 'Nåværende $0',
  viewHint: '$0 visning',
  navLinkHint: 'Gå til $0',
  moreLinkHint(eventCnt: number) {
    return `Vis ${eventCnt} flere hendelse${eventCnt === 1 ? '' : 'r'}`
  },
} as LocaleInput
