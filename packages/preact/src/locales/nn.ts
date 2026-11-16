import { LocaleInput } from '../datelib/locale'

function unitLabel(unitText: string): string {
  return (unitText || 'periode').toLocaleLowerCase('nn')
}

const todayHints = {
  day: 'I dag',
  week: 'Denne veka',
  month: 'Denne månaden',
  year: 'I år',
}

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
  prevHint(unitText) {
    return `Førre ${unitLabel(unitText)}`
  },
  nextHint(unitText) {
    return `Neste ${unitLabel(unitText)}`
  },
  todayHint(unitText, unit) {
    return todayHints[unit] || `Noverande ${unitLabel(unitText)}`
  },
  viewHint(unitText) {
    return `Vis ${unitLabel(unitText)}`
  },
  navLinkHint: 'Gå til $0',
  moreLinkHint(eventCnt: number) {
    return `Vis ${eventCnt} hending${eventCnt === 1 ? '' : 'ar'} til`
  },
  closeHint: 'Lukk',
  eventsHint: 'Hendingar',
} as LocaleInput
