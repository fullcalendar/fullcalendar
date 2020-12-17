import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'eo',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Antaŭa',
    next: 'Sekva',
    today: 'Hodiaŭ',
    month: 'Monato',
    week: 'Semajno',
    day: 'Tago',
    list: 'Tagordo',
  },
  weekText: 'Sm',
  allDayText: 'Tuta tago',
  moreLinkText: 'pli',
  noEventsText: 'Neniuj eventoj por montri',
} as LocaleInput
