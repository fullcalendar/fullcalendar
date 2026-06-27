import { LocaleInput } from '../datelib/locale'

export default {
  code: 'zh-cn',
  week: {
    // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
    dow: 1, // Monday is the first day of the week.
    doy: 4, // The week that contains Jan 4th is the first week of the year.
  },
  prevText: '上月',
  nextText: '下月',
  todayText: '今天',
  yearText: '年',
  monthText: '月',
  weekTextLong: '周',
  dayText: '日',
  listText: '日程',
  allDayText: '全天',
  moreLinkText(n) {
    return '另外 ' + n + ' 个'
  },
  noEventsText: '没有事件显示',
} as LocaleInput
