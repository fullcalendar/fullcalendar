import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'hu',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'vissza',
    next: 'előre',
    today: 'ma',
    month: 'Hónap',
    week: 'Hét',
    day: 'Nap',
    list: 'Napló',
  },
  weekText: 'Hét',
  allDayText: 'Egész nap',
  moreLinkText: 'további',
  noEventsText: 'Nincs megjeleníthető esemény',
} as LocaleInput
