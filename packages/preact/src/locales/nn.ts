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
  noEventsText: 'Ingen hendingar å vise',
  prevHint: 'Førre $0',
  nextHint: 'Neste $0',
  todayHint: 'Noverande $0',
  viewHint: '$0 vising',
  navLinkHint: 'Gå til $0',
  moreLinkHint(eventCnt: number) {
    return `Vis ${eventCnt} fleire hending${eventCnt === 1 ? '' : 'ar'}`
  },
} as LocaleInput
