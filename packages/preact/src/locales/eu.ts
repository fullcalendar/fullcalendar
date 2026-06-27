import { LocaleInput } from '../datelib/locale'

export default {
  code: 'eu',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Aur',
  nextText: 'Hur',
  todayText: 'Gaur',
  yearText: 'Urtea',
  monthText: 'Hilabetea',
  weekTextLong: 'Astea',
  weekTextShort: 'As',
  dayText: 'Eguna',
  listText: 'Agenda',
  allDayText: 'Egun\nosoa',
  moreLinkText: 'gehiago',
  noEventsText: 'Ez dago ekitaldirik erakusteko',
} as LocaleInput
