import { LocaleInput } from '../datelib/locale'

export default {
  code: 'pt',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Anterior',
  nextText: 'Seguinte',
  todayText: 'Hoje',
  yearText: 'Ano',
  monthText: 'Mês',
  weekTextLong: 'Semana',
  weekTextShort: 'Sem',
  dayText: 'Dia',
  listText: 'Agenda',
  allDayText: 'Todo\no dia',
  moreLinkText: 'mais',
  noEventsText: 'Não há eventos para mostrar',
} as LocaleInput
