import { LocaleInput } from '../datelib/locale'

export default {
  code: 'el',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4st is the first week of the year.
  },
  prevText: 'Προηγούμενος',
  nextText: 'Επόμενος',
  todayText: 'Σήμερα',
  yearText: 'Ετος',
  monthText: 'Μήνας',
  weekTextLong: 'Εβδομάδα',
  weekTextShort: 'Εβδ',
  dayText: 'Ημέρα',
  listText: 'Ατζέντα',
  allDayText: 'Ολοήμερο',
  moreLinkText: 'περισσότερα',
  noEventsText: 'Δεν υπάρχουν γεγονότα προς εμφάνιση',
} as LocaleInput
