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
The day of the column that the now-indicator is drawn within. Usually now's own day, but when slotMaxTime
extends past midnight, it might only be within the previous day's column (#6394).
Undefined if now isn't within any column.
*/
export function computeNowIndicatorDayDate(
  nowDate: DateMarker,
  nowIndicatorSegsByCol: unknown[][],
  cells: { date: DateMarker }[],
): DateMarker | undefined {
  const nowDayMs = startOfDay(nowDate).valueOf()
  let firstDayDate: DateMarker | undefined

  for (let col = 0; col < cells.length; col++) {
    if (nowIndicatorSegsByCol[col]?.length) {
      const { date } = cells[col]

      if (date.valueOf() === nowDayMs) {
        return date
      }
      if (!firstDayDate) {
        firstDayDate = date
      }
    }
  }

  return firstDayDate
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
