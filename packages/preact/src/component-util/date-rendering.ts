import { DateRange, rangeContainsMarker, DateEnv, DateMarker } from '@full-ui/headless-calendar'
import { DateProfile } from '../DateProfileGenerator'

export interface DateMeta {
  dow: number
  date: Date // the zoned date
  isDisabled: boolean
  isOther: boolean // like, is it in the non-current "other" month
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}

export function getDateMeta(
  dateMarker: DateMarker,
  dateEnv: DateEnv,
  dateProfile?: DateProfile,
  todayRange?: DateRange,
  nowDate?: DateMarker,
): DateMeta {
  const isDisabled = Boolean(dateProfile && (!dateProfile.activeRange || !rangeContainsMarker(dateProfile.activeRange, dateMarker)))
  return {
    date: dateEnv.toDate(dateMarker),
    dow: dateMarker.getUTCDay(),
    isDisabled,
    isOther: !isDisabled && Boolean(dateProfile && !rangeContainsMarker(dateProfile.currentRange, dateMarker)),
    isToday: !isDisabled && Boolean(todayRange && rangeContainsMarker(todayRange, dateMarker)),
    isPast: !isDisabled && Boolean(nowDate ? (dateMarker < nowDate) : todayRange ? (dateMarker < todayRange.start) : false),
    isFuture: !isDisabled && Boolean(nowDate ? (dateMarker > nowDate) : todayRange ? (dateMarker >= todayRange.end) : false),
  }
}
