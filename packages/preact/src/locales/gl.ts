import { LocaleInput } from '../datelib/locale'

export default {
  code: 'gl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Ant',
  nextText: 'Seg',
  todayText: 'Hoxe',
  yearText: 'Ano',
  monthText: 'Mes',
  weekTextLong: 'Semana',
  weekTextShort: 'Sm',
  dayText: 'Día',
  listText: 'Axenda',
  prevHint: '$0 antes',
  nextHint: '$0 seguinte',
  todayHint(unitText, unit) {
    return (unit === 'day') ? 'Hoxe' :
      ((unit === 'week') ? 'Esta' : 'Este') + ' ' + unitText.toLocaleLowerCase()
  },
  viewHint(unitText, unit) {
    return 'Vista ' + (unit === 'week' ? 'da' : 'do') + ' ' + unitText.toLocaleLowerCase()
  },
  allDayText: 'Todo\no día',
  moreLinkText: 'máis',
  moreLinkHint(eventCnt) {
    return `Amosar ${eventCnt} eventos máis`
  },
  noEventsText: 'Non hai eventos para amosar',
  navLinkHint: 'Ir ao $0',
  closeHint: 'Pechar',
  eventsHint: 'Eventos',
} as LocaleInput
