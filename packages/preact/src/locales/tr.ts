import { LocaleInput } from '../datelib/locale'

export default {
  code: 'tr',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 7, // The week that contains Jan 1st is the first week of the year.
  },
  prevText: 'geri',
  nextText: 'ileri',
  prevYearText: 'Önceki yıl',
  nextYearText: 'Sonraki yıl',
  todayText: 'bugün',
  yearText: 'Yıl',
  monthText: 'Ay',
  weekTextLong: 'Hafta',
  weekTextShort: 'Hf',
  dayText: 'Gün',
  listText: 'Ajanda',
  allDayText: 'Tüm gün',
  timedText: 'Saatli',
  moreLinkText: 'daha fazla',
  noEventsText: 'Gösterilecek etkinlik yok',
  prevHint(unitText) {
    return 'Önceki ' + unitText.toLocaleLowerCase('tr')
  },
  nextHint(unitText) {
    return 'Sonraki ' + unitText.toLocaleLowerCase('tr')
  },
  todayHint(unitText, unit) {
    // → Bugün, Bu hafta, Bu ay, Bu yıl
    return (unit === 'day') ? 'Bugün' : 'Bu ' + unitText.toLocaleLowerCase('tr')
  },
  viewHint: '$0 görünümü',
  viewChangeHint: 'Görünümü değiştir',
  navLinkHint: '$0 tarihine git',
  moreLinkHint(eventCnt: number) {
    return `${eventCnt} etkinlik daha göster`
  },
  closeHint: 'Kapat',
  eventsHint: 'Etkinlikler',
} as LocaleInput
