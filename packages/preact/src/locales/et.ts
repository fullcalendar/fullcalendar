import { LocaleInput } from '../datelib/locale'

export default {
  code: 'et',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Eelnev',
  nextText: 'Järgnev',
  todayText: 'Täna',
  yearText: 'Aasta',
  monthText: 'Kuu',
  weekTextLong: 'Nädal',
  weekTextShort: 'Näd',
  dayText: 'Päev',
  listText: 'Päevakord',
  allDayText: 'Kogu\npäev',
  moreLinkText(n) {
    return '+ veel ' + n
  },
  noEventsText: 'Kuvamiseks puuduvad sündmused',
} as LocaleInput
