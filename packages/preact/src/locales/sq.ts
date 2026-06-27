import { LocaleInput } from '../datelib/locale'

export default {
  code: 'sq',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'mbrapa',
  nextText: 'Përpara',
  todayText: 'Sot',
  yearText: 'Viti',
  monthText: 'Muaj',
  weekTextLong: 'Javë',
  weekTextShort: 'Ja',
  dayText: 'Ditë',
  listText: 'Listë',
  allDayText: 'Gjithë\nditën',
  moreLinkText(n) {
    return '+më tepër ' + n
  },
  noEventsText: 'Nuk ka evente për të shfaqur',
} as LocaleInput
