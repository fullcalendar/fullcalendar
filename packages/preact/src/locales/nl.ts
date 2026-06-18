import { LocaleInput } from '../datelib/locale'

export default {
  code: 'nl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Vorige',
  nextText: 'Volgende',
  todayText: 'Vandaag',
  yearText: 'Jaar',
  monthText: 'Maand',
  weekTextLong: 'Week',
  dayText: 'Dag',
  listText: 'Lijst',
  allDayText: 'Hele dag',
  moreLinkText: 'extra',
  noEventsText: 'Geen evenementen om te laten zien',
} as LocaleInput
