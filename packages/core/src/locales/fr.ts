import { LocaleInput } from '../index.js'

export default {
  code: 'fr',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Précédent',
    next: 'Suivant',
    today: 'Aujourd\'hui',
    year: 'Année',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    list: 'Planning',
  },
  weekText: 'Sem.',
  weekTextLong: 'Semaine',
  allDayText: 'Toute la journée',
  moreLinkText: 'en plus',
  noEventsText: 'Aucun évènement à afficher',
} as LocaleInput
