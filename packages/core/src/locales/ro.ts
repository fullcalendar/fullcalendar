import { LocaleInput } from '../index.js'

export default {
  code: 'ro',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: 'precedentă',
    next: 'următoare',
    today: 'Azi',
    year: 'An',
    month: 'Lună',
    week: 'Săptămână',
    day: 'Zi',
    list: 'Agendă',
  },
  weekText: 'Săpt',
  allDayText: 'Toată ziua',
  moreLinkText(n) {
    return '+alte ' + n
  },
  noEventsText: 'Nu există evenimente de afișat',
} as LocaleInput
