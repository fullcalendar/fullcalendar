import { LocaleInput } from '../index.js'

export default {
  code: 'uz-cy',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Олин',
    next: 'Кейин',
    today: 'Бугун',
    month: 'Ой',
    week: 'Ҳафта',
    day: 'Кун',
    list: 'Кун тартиби',
  },
  weekText: 'Ҳафта',
  allDayText: 'Кун бўйича',
  moreLinkText(n) {
    return '+ яна ' + n
  },
  noEventsText: 'Кўрсатиш учун воқеалар йўқ',
} as LocaleInput
