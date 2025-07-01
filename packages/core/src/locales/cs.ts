import { LocaleInput } from '../index.js'

export default {
  code: 'cs',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Dříve',
    next: 'Později',
    today: 'Dnes',
    year: 'Rok',
    month: 'Měsíc',
    week: 'Týden',
    day: 'Den',
    list: 'Agenda',
  },
  weekText: 'Týd',
  allDayText: 'Celý den',
  moreLinkText(n) {
    return '+další: ' + n
  },
  noEventsText: 'Žádné akce k zobrazení',
} as LocaleInput
