import { LocaleInput } from '../datelib/locale'

export default {
  code: 'fr',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Précédent',
  nextText: 'Suivant',
  todayText: 'Aujourd\'hui',
  yearText: 'Année',
  monthText: 'Mois',
  weekTextLong: 'Semaine',
  weekTextShort: 'Sem.',
  dayText: 'Jour',
  listText: 'Planning',
  allDayText: 'Toute la\njournée',
  moreLinkText: 'en plus',
  noEventsText: 'Aucun évènement à afficher',
} as LocaleInput
