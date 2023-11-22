import { LocaleInput } from '../index.js'

export default {
  code: 'nl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Vorige',
    next: 'Volgende',
    today: 'Vandaag',
    year: 'Jaar',
    month: 'Maand',
    week: 'Week',
    day: 'Dag',
    list: 'Lijst',
  },
  allDayText: 'Hele dag',
  moreLinkText: 'extra',
  noEventsText: 'Geen evenementen om te laten zien',
} as LocaleInput
