import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'nn',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Førre',
    next: 'Neste',
    today: 'I dag',
    month: 'Månad',
    week: 'Veke',
    day: 'Dag',
    list: 'Agenda',
  },
  weekText: 'Veke ', // Needs a space because it's not abbreviated, otherwise the text ends up like "Veke2"
  allDayText: 'Heile dagen',
  moreLinkText: 'til',
  noEventsText: 'Ingen hendingar å syne',
} as LocaleInput
