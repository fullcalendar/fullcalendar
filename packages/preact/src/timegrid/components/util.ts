import { Duration, asRoughMs, createDuration, DateMarker, startOfDay } from '@full-ui/headless-calendar'
import { DateProfile } from '../../DateProfileGenerator'

export function computeSlatHeight(
  expandRows: boolean,
  slatCnt: number,
  explicitSlatMinHeight: number = 0,
  slatInnerHeight: number | undefined, // from the "inner" i think
  scrollerHeight: number | undefined,
): [
  slatHeight: number | undefined,
  slatLiquid: boolean,
] {
  if (!slatInnerHeight || !scrollerHeight) {
    return [undefined, false]
  }

  const slatMinHeight = Math.max(slatInnerHeight + 1, explicitSlatMinHeight)
  const slatLiquidHeight = scrollerHeight / slatCnt
  let slatLiquid: boolean
  let slatHeight: number

  if (expandRows && slatLiquidHeight >= slatMinHeight) {
    slatLiquid = true
    slatHeight = slatLiquidHeight
  } else {
    slatLiquid = false
    slatHeight = slatMinHeight
  }

  return [slatHeight, slatLiquid]
}

/*
A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
*/
export function computeDateTopFrac(
  date: DateMarker,
  dateProfile: DateProfile,
  startOfDayDate?: DateMarker,
): number {
  if (!startOfDayDate) {
    startOfDayDate = startOfDay(date)
  }
  return computeTimeTopFrac(
    createDuration(date.valueOf() - startOfDayDate.valueOf()),
    dateProfile,
  )
}

export function computeTimeTopFrac(time: Duration, dateProfile: DateProfile): number {
  const startMs = asRoughMs(dateProfile.slotMinTime)
  const endMs = asRoughMs(dateProfile.slotMaxTime)
  let frac = (time.milliseconds - startMs) / (endMs - startMs)

  frac = Math.max(0, frac)
  frac = Math.min(1, frac)

  return frac
}
