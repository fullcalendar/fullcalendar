import { LocaleInput } from '../datelib/locale'

function affix(unitText: string): string {
  return (unitText === 'Tag' || unitText === 'Monat') ? 'r' :
    unitText === 'Jahr' ? 's' : ''
}

const viewHints = {
  Tag: 'Tagesansicht',
  Woche: 'Wochenansicht',
  Monat: 'Monatsansicht',
  Jahr: 'Jahresansicht',
}

export default {
  code: 'de-at',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Zurück',
  nextText: 'Vor',
  todayText: 'Heute',
  yearText: 'Jahr',
  monthText: 'Monat',
  weekTextLong: 'Woche',
  weekTextShort: 'KW',
  dayText: 'Tag',
  listText: 'Terminübersicht',
  allDayText: 'Ganztägig',
  moreLinkText(n) {
    return '+ weitere ' + n
  },
  noEventsText: 'Keine Ereignisse anzuzeigen',
  prevHint(unitText) {
    return `Vorherige${affix(unitText)} ${unitText}`
  },
  nextHint(unitText) {
    return `Nächste${affix(unitText)} ${unitText}`
  },
  todayHint(unitText) {
    // → Heute, Diese Woche, Dieser Monat, Dieses Jahr
    if (unitText === 'Tag') {
      return 'Heute'
    }
    return `Diese${affix(unitText)} ${unitText}`
  },
  viewHint(unitText) {
    // other button text, like Terminübersicht, already names the view
    return viewHints[unitText] || unitText
  },
  navLinkHint: 'Gehe zu $0',
  moreLinkHint(eventCnt: number) {
    return 'Zeige ' + (eventCnt === 1 ?
      'ein weiteres Ereignis' :
      eventCnt + ' weitere Ereignisse')
  },
  closeHint: 'Schließen',
  eventsHint: 'Ereignisse',
} as LocaleInput
