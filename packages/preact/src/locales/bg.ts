import { LocaleInput } from '../datelib/locale'

// седмица and година are feminine; ден, месец, and the период fallback are masculine
function isFeminine(unit: string): boolean {
  return unit === 'week' || unit === 'year'
}

function unitLabel(unitText: string): string {
  return (unitText || 'период').toLocaleLowerCase('bg')
}

export default {
  code: 'bg',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'назад',
  nextText: 'напред',
  todayText: 'днес',
  yearText: 'година',
  monthText: 'Месец',
  weekTextLong: 'Седмица',
  dayText: 'Ден',
  listText: 'График',
  allDayText: 'Цял ден',
  moreLinkText(n) {
    return '+още ' + n
  },
  noEventsText: 'Няма събития за показване',
  prevHint(unitText, unit) {
    return `${isFeminine(unit) ? 'Предишна' : 'Предишен'} ${unitLabel(unitText)}`
  },
  nextHint(unitText, unit) {
    return `${isFeminine(unit) ? 'Следваща' : 'Следващ'} ${unitLabel(unitText)}`
  },
  todayHint(unitText, unit) {
    if (unit === 'day') {
      return 'Днес'
    }
    return `${isFeminine(unit) ? 'Тази' : 'Този'} ${unitLabel(unitText)}`
  },
  navLinkHint: 'Отиди на $0',
  moreLinkHint(eventCnt: number) {
    return eventCnt === 1 ? 'Покажи още едно събитие' : `Покажи още ${eventCnt} събития`
  },
  closeHint: 'Затвори',
  eventsHint: 'Събития',
} as LocaleInput
