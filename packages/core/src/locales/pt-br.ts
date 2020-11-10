import { LocaleInput } from '@fullcalendar/common'

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
  weekText: 'Sm',
  allDayText: 'dia inteiro',
  moreLinkText(n) {
    return 'mais +' + n
  },
  noEventsText: 'Não há eventos para mostrar',
} as LocaleInput
