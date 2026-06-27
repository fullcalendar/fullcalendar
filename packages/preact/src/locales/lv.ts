import { LocaleInput } from '../datelib/locale'

export default {
  code: 'lv',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Iepr.',
  nextText: 'Nāk.',
  todayText: 'Šodien',
  yearText: 'Gads',
  monthText: 'Mēnesis',
  weekTextLong: 'Nedēļa',
  weekTextShort: 'Ned.',
  dayText: 'Diena',
  listText: 'Dienas kārtība',
  allDayText: 'Visu\ndienu',
  moreLinkText(n) {
    return '+vēl ' + n
  },
  noEventsText: 'Nav notikumu',
} as LocaleInput
