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


export function getDateMeta(exactDate: DateMarker, todayRange?: DateRange, nowDate?: DateMarker): DateMeta { // TODO: disallow optional
  return {
    dow: nowDate.getUTCDay(),
    isDisabled: false,
    isOther: false,
    isToday: todayRange && rangeContainsMarker(todayRange, exactDate),
    isPast: nowDate && exactDate < nowDate,
    isFuture: nowDate && exactDate > nowDate
  }
}


export function getDayMeta(dayDate: DateMarker, todayRange?: DateRange, dateProfile?: DateProfile): DateMeta { // TODO: disallow optional
  return {
    dow: dayDate.getUTCDay(),
    isDisabled: dateProfile && !rangeContainsMarker(dateProfile.activeRange, dayDate),
    isOther: dateProfile && !rangeContainsMarker(dateProfile.currentRange, dayDate),
    isToday: todayRange && dayDate.valueOf() === todayRange.start.valueOf(),
    isPast: todayRange && dayDate < todayRange.start,
    isFuture: todayRange && dayDate >= todayRange.end
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


export function getSlatClassNames(meta: DateMeta, theme: Theme) {
  let classNames: string[] = [
    'fc-slat'
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


export function getDateTimeClassNames(meta: DateMeta, classNameScope: string, theme: Theme) {
  let classNames: string[] = [ classNameScope ]

  if (meta.isToday) {
    classNames.push(`${classNameScope}-today`)
    classNames.push(theme.getClass('today'))
  }

  if (meta.isPast) {
    classNames.push(`${classNameScope}-past`)
  }

  if (meta.isFuture) {
    classNames.push(`${classNameScope}-future`)
  }

  return classNames
}
