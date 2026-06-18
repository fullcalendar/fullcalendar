import { LocaleInput } from '../datelib/locale'

function affix(unitText: string): string {
  return (unitText === 'Tag' || unitText === 'Monat') ? 'r' :
    unitText === 'Jahr' ? 's' : ''
}

export default {
  code: 'de',
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
    // → Tagesansicht, Wochenansicht, Monatsansicht, Jahresansicht
    const glue = unitText === 'Woche' ? 'n' : unitText === 'Monat' ? 's' : 'es'
    return unitText + glue + 'ansicht'
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
