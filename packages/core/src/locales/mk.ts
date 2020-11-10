import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'mk',
  buttonText: {
    prev: 'претходно',
    next: 'следно',
    today: 'Денес',
    month: 'Месец',
    week: 'Недела',
    day: 'Ден',
    list: 'График',
  },
  weekText: 'Сед',
  allDayText: 'Цел ден',
  moreLinkText(n) {
    return '+повеќе ' + n
  },
  noEventsText: 'Нема настани за прикажување',
} as LocaleInput
