import { LocaleInput } from '../datelib/locale'

export default {
  code: 'sv',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Förra',
  nextText: 'Nästa',
  todayText: 'Idag',
  yearText: 'År',
  monthText: 'Månad',
  weekTextLong: 'Vecka',
  weekTextShort: 'v.',
  dayText: 'Dag',
  listText: 'Program',
  prevHint(unitText) {
    return `Föregående ${unitText.toLocaleLowerCase()}`
  },
  nextHint(unitText) {
    return `Nästa ${unitText.toLocaleLowerCase()}`
  },
  todayHint(unitText, unit) {
    return (unit === 'year' ? 'I' : 'Denna') + ' ' + unitText.toLocaleLowerCase()
  },
  viewHint: '$0 vy',
  navLinkHint: 'Gå till $0',
  moreLinkHint(eventCnt: number) {
    return `Visa ytterligare ${eventCnt} händelse${eventCnt === 1 ? '' : 'r'}`
  },
  allDayText: 'Heldag',
  moreLinkText: 'till',
  noEventsText: 'Inga händelser att visa',
  closeHint: 'Stäng',
  eventsHint: 'Händelser',
} as LocaleInput
