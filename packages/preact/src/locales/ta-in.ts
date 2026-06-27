import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ta-in',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'முந்தைய',
  nextText: 'அடுத்தது',
  todayText: 'இன்று',
  yearText: 'ஆண்டு',
  monthText: 'மாதம்',
  weekTextLong: 'வாரம்',
  dayText: 'நாள்',
  listText: 'தினசரி அட்டவணை',
  allDayText: 'நாள்\nமுழுவதும்',
  moreLinkText(n) {
    return '+ மேலும் ' + n
  },
  noEventsText: 'காண்பிக்க நிகழ்வுகள் இல்லை',
} as LocaleInput
