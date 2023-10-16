import { LocaleInput } from '../index.js'

export default {
  code: 'bg',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: 'назад',
    next: 'напред',
    today: 'днес',
    year: 'година',
    month: 'Месец',
    week: 'Седмица',
    day: 'Ден',
    list: 'График',
  },
  allDayText: 'Цял ден',
  moreLinkText(n) {
    return '+още ' + n
  },
  noEventsText: 'Няма събития за показване',
  buttonHints: {
    prev(buttonText) {
      return `Предишен ${affix(buttonText)} ${buttonText}`
    },
    next(buttonText) {
      return `Следващ ${affix(buttonText)} ${buttonText}`
    },
    today(buttonText) {
      // → Днес, тази седмица, този месец, тази година
      if (buttonText === 'Tag') {
        return 'Днес'
      }
      return `Това ${affix(buttonText)} ${buttonText}`
    },
  },
  navLinkHint: 'Отидете на $0',
  moreLinkHint(eventCnt: number) {
    return 'Покажи ' + (eventCnt === 1 ?
      'друго събитие' :
      eventCnt + ' по-нататъшни събития')
  },
  closeHint: 'Близо',
  timeHint: 'Време',
  eventHint: 'Събитие',
} as LocaleInput
