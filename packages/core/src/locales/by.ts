
import { LocaleInput } from '../index.js'

export default {
  code: 'by',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Папярыдні',
    next: 'Наступны',
    today: 'Сёння',
    year: 'Год',
    month: 'Месяц',
    week: 'Тыдзень',
    day: 'Дзень',
    list: 'Парадак дня',
  },
  weekText: 'Тыд',
  allDayText: 'Увесь дзень',
  moreLinkText(n) {
    return '+ яшчэ ' + n
  },
  noEventsText: 'Няма падзей для адлюстравання',
} as LocaleInput
