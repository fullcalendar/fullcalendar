import { LocaleInput } from '../index.js'

export default {
  code: 'fi',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  buttonText: {
    prev: 'Edellinen',
    next: 'Seuraava',
    today: 'Tänään',
    year: 'Vuosi',
    month: 'Kuukausi',
    week: 'Viikko',
    day: 'Päivä',
    list: 'Tapahtumat',
  },
  weekText: 'Vk',
  allDayText: 'Koko päivä',
  moreLinkText: 'lisää',
  noEventsText: 'Ei näytettäviä tapahtumia',
} as LocaleInput
