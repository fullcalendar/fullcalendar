import { LocaleInput } from '../index.js'

export default {
  code: 'el',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4st is the first week of the year.
  },
  buttonText: {
    prev: 'Προηγούμενος',
    next: 'Επόμενος',
    today: 'Σήμερα',
    year: 'Ετος',
    month: 'Μήνας',
    week: 'Εβδομάδα',
    day: 'Ημέρα',
    list: 'Ατζέντα',
  },
  weekText: 'Εβδ',
  allDayText: 'Ολοήμερο',
  moreLinkText: 'περισσότερα',
  noEventsText: 'Δεν υπάρχουν γεγονότα προς εμφάνιση',
} as LocaleInput
