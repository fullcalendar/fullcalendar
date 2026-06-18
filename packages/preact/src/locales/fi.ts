import { LocaleInput } from '../datelib/locale'

export default {
  code: 'fi',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'Edellinen',
  nextText: 'Seuraava',
  todayText: 'Tänään',
  yearText: 'Vuosi',
  monthText: 'Kuukausi',
  weekTextLong: 'Viikko',
  weekTextShort: 'Vk',
  dayText: 'Päivä',
  listText: 'Tapahtumat',
  allDayText: 'Koko\npäivä',
  moreLinkText: 'lisää',
  noEventsText: 'Ei näytettäviä tapahtumia',
} as LocaleInput
