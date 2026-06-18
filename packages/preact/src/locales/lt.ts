import { LocaleInput } from '../datelib/locale'

export default {
  code: 'lt',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Atgal',
  nextText: 'Pirmyn',
  todayText: 'Šiandien',
  yearText: 'Metai',
  monthText: 'Mėnuo',
  weekTextLong: 'Savaitė',
  weekTextShort: 'SAV',
  dayText: 'Diena',
  listText: 'Darbotvarkė',
  allDayText: 'Visą\ndieną',
  moreLinkText: 'daugiau',
  noEventsText: 'Nėra įvykių rodyti',
} as LocaleInput
