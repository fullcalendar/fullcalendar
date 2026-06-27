import { Duration, asRoughMs, createDuration, DateEnv, DateMarker, DateRange, startOfDay } from '@full-ui/headless-calendar'
import { DateProfile, DateProfileGenerator } from '../../DateProfileGenerator'
import { DaySeriesModel } from '../../common/DaySeriesModel'
import { DayTableModel } from '../../common/DayTableModel'

export function buildTimeColsModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator, dateEnv: DateEnv) {
  let daySeries = new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(daySeries, false, dateEnv)
}

export function buildDayRanges(dayTableModel: DayTableModel, dateProfile: DateProfile, dateEnv: DateEnv): DateRange[] {
  let ranges: DateRange[] = []

  for (let date of dayTableModel.headerDates) {
    ranges.push({
      start: dateEnv.add(date, dateProfile.slotMinTime),
      end: dateEnv.add(date, dateProfile.slotMaxTime),
    })
  }

  return ranges
}

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
