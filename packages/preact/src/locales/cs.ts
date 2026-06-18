import { LocaleInput } from '../datelib/locale'

export default {
  code: 'cs',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Dříve',
  nextText: 'Později',
  todayText: 'Nyní',
  yearText: 'Rok',
  monthText: 'Měsíc',
  weekTextLong: 'Týden',
  weekTextShort: 'Týd',
  dayText: 'Den',
  listText: 'Agenda',
  allDayText: 'Celý den',
  moreLinkText(n) {
    return '+další: ' + n
  },
  noEventsText: 'Žádné akce k zobrazení',
} as LocaleInput
