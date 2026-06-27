import { LocaleInput } from '../datelib/locale'

export default {
  code: 'th',
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: 'ก่อนหน้า',
  nextText: 'ถัดไป',
  prevYearText: 'ปีก่อนหน้า',
  nextYearText: 'ปีถัดไป',
  yearText: 'ปี',
  todayText: 'วันนี้',
  monthText: 'เดือน',
  weekTextLong: 'สัปดาห์',
  dayText: 'วัน',
  listText: 'กำหนดการ',
  allDayText: 'ตลอดวัน',
  moreLinkText: 'เพิ่มเติม',
  noEventsText: 'ไม่มีกิจกรรมที่จะแสดง',
} as LocaleInput
