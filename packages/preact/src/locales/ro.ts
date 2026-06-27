import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ro',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'precedentă',
  nextText: 'următoare',
  todayText: 'Azi',
  yearText: 'An',
  monthText: 'Lună',
  weekTextLong: 'Săptămână',
  weekTextShort: 'Săpt',
  dayText: 'Zi',
  listText: 'Agendă',
  allDayText: 'Toată\nziua',
  moreLinkText(n) {
    return '+alte ' + n
  },
  noEventsText: 'Nu există evenimente de afișat',
} as LocaleInput
