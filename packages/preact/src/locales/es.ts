import { LocaleInput } from '../datelib/locale'

export default {
  code: 'es',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Ant',
  nextText: 'Sig',
  todayText: 'Hoy',
  yearText: 'Año',
  monthText: 'Mes',
  weekTextLong: 'Semana',
  weekTextShort: 'Sm',
  dayText: 'Día',
  listText: 'Agenda',
  prevHint: '$0 antes',
  nextHint: '$0 siguiente',
  todayHint(unitText, unit) {
    return (unit === 'day') ? 'Hoy' :
      ((unit === 'week') ? 'Esta' : 'Este') + ' ' + unitText.toLocaleLowerCase()
  },
  viewHint(unitText, unit) {
    return 'Vista ' + (unit === 'week' ? 'de la' : 'del') + ' ' + unitText.toLocaleLowerCase()
  },
  allDayText: 'Todo\nel día',
  moreLinkText: 'más',
  moreLinkHint(eventCnt) {
    return `Mostrar ${eventCnt} eventos más`
  },
  noEventsText: 'No hay eventos para mostrar',
  navLinkHint: 'Ir al $0',
  closeHint: 'Cerrar',
  eventsHint: 'Eventos',
} as LocaleInput
