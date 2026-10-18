import { LocaleInput } from '../datelib/locale'

export default {
  code: 'ko',
  prevText: '이전',
  nextText: '다음',
  todayText: '오늘',
  yearText: '연도',
  monthText: '월',
  weekTextLong: '주',
  dayText: '일',
  listText: '일정',
  allDayText: '종일',
  moreLinkText(n) {
    return `+${n}개 더보기`
  },
  noEventsText: '일정이 없습니다',
} as LocaleInput
