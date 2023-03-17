import { LocaleInput } from '../index.js'

export default {
  code: 'pt',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Anterior',
    next: 'Seguinte',
    today: 'Hoje',
    year: 'Ano',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    list: 'Agenda',
  },
  weekText: 'Sem',
  allDayText: 'Todo o dia',
  moreLinkText: 'mais',
  noEventsText: 'Não há eventos para mostrar',
} as LocaleInput
