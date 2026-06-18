import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ku',
  week: {
    dow: 6, // Saturday is the first day of the week.
    doy: 12, // The week that contains Jan 1st is the first week of the year.
  },
  direction: 'rtl',
  prevText: 'پێشتر',
  nextText: 'دواتر',
  todayText: 'ئەمڕو',
  yearText: 'ساڵ',
  monthText: 'مانگ',
  weekTextLong: 'هەفتە',
  dayText: 'ڕۆژ',
  listText: 'بەرنامە',
  allDayText: 'هەموو ڕۆژەکە',
  moreLinkText: 'زیاتر',
  noEventsText: 'هیچ ڕووداوێك نیە',
} as LocaleInput
