import { LocaleInput } from '../index.js'

export default {
  code: 'tg',

  week: {
    dow: 1,
    doy: 4,
  },

  buttonText: {
    prev: 'Қаблӣ',
    next: 'Баъдӣ',
    today: 'Имрӯз',
    year: 'Сол',
    month: 'Моҳ',
    week: 'Ҳафта',
    day: 'Рӯз',
    list: 'Рӯйхат',
  },

  weekText: 'Ҳафта',
  allDayText: 'Тамоми рӯз',

  moreLinkText(n) {
    return '+ бештар ' + n
  },

  noEventsText: 'Ҳеҷ рӯйдоде барои намоиш нест',

  dayNames: ['Якшанбе', 'Душанбе', 'Сешанбе', 'Чоршанбе', 'Панҷшанбе', 'Ҷумъа', 'Шанбе'],
  dayNamesShort: ['Якш', 'Душ', 'Сеш', 'Чор', 'Панҷ', 'Ҷум', 'Шан'],

  monthNames: [
    'Январ',
    'Феврал',
    'Март',
    'Апрел',
    'Май',
    'Июн',
    'Июл',
    'Август',
    'Сентябр',
    'Октябр',
    'Ноябр',
    'Декабр',
  ],

  monthNamesShort: [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ],

} as LocaleInput