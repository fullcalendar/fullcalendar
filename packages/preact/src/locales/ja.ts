import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ja',
  prevText: '前',
  nextText: '次',
  todayText: '今日',
  yearText: '年',
  monthText: '月',
  weekTextLong: '週',
  dayText: '日',
  listText: '予定リスト',
  allDayText: '終日',
  moreLinkText(n) {
    return '他 ' + n + ' 件'
  },
  noEventsText: '表示する予定はありません',
} as LocaleInput
