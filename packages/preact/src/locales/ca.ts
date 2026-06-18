import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ca',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Anterior',
  nextText: 'Següent',
  todayText: 'Avui',
  yearText: 'Any',
  monthText: 'Mes',
  weekTextLong: 'Setmana',
  weekTextShort: 'Set',
  dayText: 'Dia',
  listText: 'Agenda',
  allDayText: 'Tot\nel dia',
  moreLinkText: 'més',
  noEventsText: 'No hi ha esdeveniments per mostrar',
} as LocaleInput
