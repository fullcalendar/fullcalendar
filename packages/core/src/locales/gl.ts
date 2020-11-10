import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'gl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Ant',
    next: 'Seg',
    today: 'Hoxe',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Axenda',
  },
  weekText: 'Sm',
  allDayText: 'Todo o día',
  moreLinkText: 'máis',
  noEventsText: 'Non hai eventos para amosar',
} as LocaleInput
