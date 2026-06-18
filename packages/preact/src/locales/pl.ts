import { LocaleInput } from '../datelib/locale'

export default {
  code: 'pl',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Poprzedni',
  nextText: 'Następny',
  todayText: 'Dziś',
  yearText: 'Rok',
  monthText: 'Miesiąc',
  weekTextLong: 'Tydzień',
  weekTextShort: 'Tydz',
  dayText: 'Dzień',
  listText: 'Plan dnia',
  allDayText: 'Cały\ndzień',
  moreLinkText: 'więcej',
  noEventsText: 'Brak wydarzeń do wyświetlenia',
} as LocaleInput
