import { LocaleInput } from '../datelib/locale'

export default {
  code: 'az',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Əvvəl',
  nextText: 'Sonra',
  todayText: 'Bu Gün',
  yearText: 'Il',
  monthText: 'Ay',
  weekTextLong: 'Həftə',
  dayText: 'Gün',
  listText: 'Gündəm',
  allDayText: 'Bütün\nGün',
  moreLinkText(n) {
    return '+ daha çox ' + n
  },
  noEventsText: 'Göstərmək üçün hadisə yoxdur',
} as LocaleInput
