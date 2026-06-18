import { LocaleInput } from '../datelib/locale'

export default {
  code: 'pt-br',
  prevText: 'Anterior',
  nextText: 'Próximo',
  prevYearText: 'Ano anterior',
  nextYearText: 'Próximo ano',
  yearText: 'Ano',
  todayText: 'Hoje',
  monthText: 'Mês',
  weekTextLong: 'Semana',
  weekTextShort: 'Sm',
  dayText: 'Dia',
  listText: 'Lista',
  prevHint: '$0 Anterior',
  nextHint: 'Próximo $0',
  todayHint(unitText, unit) {
    return (unit === 'day') ? 'Hoje' :
      ((unit === 'week') ? 'Esta' : 'Este') + ' ' + unitText.toLocaleLowerCase()
  },
  viewHint(unitText, unit) {
    return 'Visualizar ' + (unit === 'week' ? 'a' : 'o') + ' ' + unitText.toLocaleLowerCase()
  },
  allDayText: 'Dia\ninteiro',
  moreLinkText(n) {
    return 'mais +' + n
  },
  moreLinkHint(eventCnt) {
    return `Mostrar mais ${eventCnt} eventos`
  },
  noEventsText: 'Não há eventos para mostrar',
  navLinkHint: 'Ir para $0',
  closeHint: 'Fechar',
  eventsHint: 'Eventos',
} as LocaleInput
