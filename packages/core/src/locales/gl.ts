import { LocaleInput } from '../index.js'

export default {
  code: 'gl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Ant',
    next: 'Seg',
    today: 'Hoxe',
    year: 'Ano',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Axenda',
  },
  buttonHints: {
    prev: '$0 antes',
    next: '$0 seguinte',
    today(buttonText) {
      return (buttonText === 'Día') ? 'Hoxe' :
        ((buttonText === 'Semana') ? 'Esta' : 'Este') + ' ' + buttonText.toLocaleLowerCase()
    },
  },
  viewHint(buttonText) {
    return 'Vista ' + (buttonText === 'Semana' ? 'da' : 'do') + ' ' + buttonText.toLocaleLowerCase()
  },
  weekText: 'Sm',
  weekTextLong: 'Semana',
  allDayText: 'Todo o día',
  moreLinkText: 'máis',
  moreLinkHint(eventCnt) {
    return `Amosar ${eventCnt} eventos máis`
  },
  noEventsText: 'Non hai eventos para amosar',
  navLinkHint: 'Ir ao $0',
  closeHint: 'Pechar',
  timeHint: 'A hora',
  eventHint: 'Evento',
} as LocaleInput
