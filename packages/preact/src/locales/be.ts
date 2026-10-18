import { LocaleInput } from '../datelib/locale'

export default {
  code: 'be',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'Папярэдні',
  nextText: 'Наступны',
  todayText: 'Сёння',
  yearText: 'Год',
  monthText: 'Месяц',
  weekTextLong: 'Тыдзень',
  weekTextShort: 'Тыд',
  dayText: 'Дзень',
  listText: 'Парадак дня',
  allDayText: 'Увесь дзень',
  moreLinkText(n) {
    return '+ яшчэ ' + n
  },
  noEventsText: 'Няма падзей для адлюстравання',
  closeHint: 'Закрыць',
  eventsHint: 'Падзеі',
} as LocaleInput
