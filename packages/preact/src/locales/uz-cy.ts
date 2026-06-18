import { LocaleInput } from '../datelib/locale'

export default {
  code: 'uz-cy',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Олин',
  nextText: 'Кейин',
  todayText: 'Бугун',
  monthText: 'Ой',
  weekTextLong: 'Ҳафта',
  dayText: 'Кун',
  listText: 'Кун тартиби',
  allDayText: 'Кун\nбўйича',
  moreLinkText(n) {
    return '+ яна ' + n
  },
  noEventsText: 'Кўрсатиш учун воқеалар йўқ',
} as LocaleInput
