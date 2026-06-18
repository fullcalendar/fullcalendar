import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ne', // code for nepal
  week: {
    dow: 7, // Sunday is the first day of the week.
    doy: 1, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'अघिल्लो',
  nextText: 'अर्को',
  todayText: 'आज',
  yearText: 'वर्ष',
  monthText: 'महिना',
  weekTextLong: 'हप्ता',
  dayText: 'दिन',
  listText: 'सूची',
  allDayText: 'दिनभरि',
  moreLinkText: 'थप लिंक',
  noEventsText: 'देखाउनको लागि कुनै घटनाहरू छैनन्',
} as LocaleInput
