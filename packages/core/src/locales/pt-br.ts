import { LocaleInput } from '../index.js'

export default {
  code: 'pt-br',
  buttonText: {
    prev: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    list: 'Lista',
  },
  buttonHints: {
    prev: '$0 anterior',
    next: '$0 seguinte',
    today(buttonText) {
      return (buttonText === 'Dia') ? 'Hoje' :
        ((buttonText === 'Semana') ? 'Esta' : 'Este') + ' ' + buttonText.toLocaleLowerCase()
    },
  },
  viewHint(buttonText) {
    return 'Visualizar ' + (buttonText === 'Semana' ? 'a' : 'o') + ' ' + buttonText.toLocaleLowerCase()
  },  
  weekText: 'Sm',
  weekTextLong: 'Semana',
  moreLinkText: 'mais',  
  allDayText: 'dia inteiro',
  moreLinkHint(eventCnt) {
    return `Mostrar mais ${eventCnt} eventos`
  },
  moreLinkText(n) {
    return 'mais +' + n
  },
  noEventsText: 'Não há eventos para mostrar',
  navLinkHint: 'Ir para $0',
  closeHint: 'Fechar',
  timeHint: 'A hora',
  eventHint: 'Evento',  
  
  
} as LocaleInput
