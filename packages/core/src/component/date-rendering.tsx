import { DateMarker, DAY_IDS } from '../datelib/marker'
import { rangeContainsMarker, DateRange } from '../datelib/date-range'
import { DateProfile } from '../DateProfileGenerator'
import Theme from '../theme/Theme'


export interface DateMeta {
  dow: number
  isDisabled: boolean
  isOther: boolean // like, is it in the non-current "other" month
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}


export function getDateMeta(date: DateMarker, todayRange?: DateRange, nowDate?: DateMarker, dateProfile?: DateProfile): DateMeta {
  return {
    dow: date.getUTCDay(),
    isDisabled: dateProfile && !rangeContainsMarker(dateProfile.activeRange, date),
    isOther: dateProfile && !rangeContainsMarker(dateProfile.currentRange, date),
    isToday: todayRange && rangeContainsMarker(todayRange, date),
    isPast: nowDate ? (date < nowDate) : todayRange ? (date < todayRange.start) : false,
    isFuture: nowDate ? (date > nowDate) : todayRange ? (date >= todayRange.end) : false
  }
}


export function getDayClassNames(meta: DateMeta, theme: Theme) {
  let classNames: string[] = [
    'fc-day',
    'fc-day-' + DAY_IDS[meta.dow]
  ]

  if (meta.isDisabled) { // TODO: shouldn't we avoid all other classnames if disabled?
    classNames.push('fc-day-disabled')
  }

  if (meta.isToday) {
    classNames.push('fc-day-today')
    classNames.push(theme.getClass('today'))
  }

  if (meta.isPast) {
    classNames.push('fc-day-past')
  }

  if (meta.isFuture) {
    classNames.push('fc-day-future')
  }

  if (meta.isOther) {
    classNames.push('fc-day-other')
  }

  return classNames
}


export function getSlotClassNames(meta: DateMeta, theme: Theme) {
  let classNames: string[] = [
    'fc-slat' // TODO: rename to "slot" or "slot-label"
  ]

  if (meta.isToday) {
    classNames.push('fc-slat-today')
    classNames.push(theme.getClass('today'))
  }

  if (meta.isPast) {
    classNames.push('fc-slat-past')
  }

  if (meta.isFuture) {
    classNames.push('fc-slat-future')
  }

  return classNames
}
