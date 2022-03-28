import { LocaleInput } from '@fullcalendar/common'

function affix(buttonText: 'Tag' | 'Woche' | 'Monat' | 'Jahr'): string {
  return (buttonText === 'Tag' || buttonText === 'Monat') ? 'r' :
    buttonText === 'Jahr' ? 's' : ''
}

export default {
  code: 'de',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Zurück',
    next: 'Vor',
    today: 'Heute',
    year: 'Jahr',
    month: 'Monat',
    week: 'Woche',
    day: 'Tag',
    list: 'Terminübersicht',
  },
  weekText: 'KW',
  weekTextLong: 'Woche',
  allDayText: 'Ganztägig',
  moreLinkText(n) {
    return '+ weitere ' + n
  },
  noEventsText: 'Keine Ereignisse anzuzeigen',
  buttonHints: {
    prev: function(buttonText) {
      return 'Vorherige' + affix(buttonText) + ' ' + buttonText
    },
    next: function(buttonText) {
      return 'Nächste' + affix(buttonText) + ' ' + buttonText
    },
    today: function(buttonText) {
      // → Heute, Diese Woche, Dieser Monat, Dieses Jahr
      if (buttonText === 'Tag') {
        return 'Heute'
      }
      return 'Diese' + affix(buttonText) + ' ' + buttonText
    },
  },
  viewHint: function(buttonText) {
    // → Tagesansicht, Wochenansicht, Monatsansicht, Jahresansicht
    const glue = buttonText === 'Woche' ? 'n' : buttonText === 'Monat' ? 's' : 'es'
    return buttonText + glue + 'ansicht'
  },
  navLinkHint: 'Gehe zu $0',
  moreLinkHint: function(eventCnt: number) {
    return 'Zeige ' + (eventCnt === 1 ?
      'ein weiteres Ereignis' :
      eventCnt + ' weitere Ereignisse')
  },
  closeHint: 'Schließen',
  timeHint: 'Uhrzeit',
  eventHint: 'Ereignis',
} as LocaleInput
