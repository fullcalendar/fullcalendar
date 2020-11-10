import { LocaleInput } from '@fullcalendar/common'

export default {
  code: 'uz',
  buttonText: {
    month: 'Oy',
    week: 'Xafta',
    day: 'Kun',
    list: 'Kun tartibi',
  },
  allDayText: "Kun bo'yi",
  moreLinkText(n) {
    return '+ yana ' + n
  },
  noEventsText: "Ko'rsatish uchun voqealar yo'q",
} as LocaleInput
