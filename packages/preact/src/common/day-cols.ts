import { DateEnv, DateMarker, DateRange, Duration, addDays, rangeContainsMarker } from '@full-ui/headless-calendar'
import { DateProfile, DateProfileGenerator, isMajorUnit } from '../DateProfileGenerator'
import { Dictionary } from '../options'
import { DaySeriesModel } from './DaySeriesModel'

export interface DayCol {
  key: string
  date: DateMarker
  range: DateRange
  isMajor: boolean
  isDisabled: boolean
  renderProps?: Dictionary
  attrs?: Dictionary
  className?: string
  dateSpanProps?: Dictionary
}

export interface DayColSlotRange {
  slotMinTime: Duration
  slotMaxTime: Duration
}

interface BuildDayColsConfig {
  slotRange?: DayColSlotRange
  majorUnit?: string
  activeRange?: DateRange | null
}

export function buildDayCols(
  dateProfile: DateProfile,
  dateProfileGenerator: DateProfileGenerator,
  dateEnv: DateEnv,
  slotRange?: DayColSlotRange,
  majorUnit = '', // timegrid passes none, keeping all columns non-major
): DayCol[] {
  return buildDayColsFromSeries(
    new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator),
    dateEnv,
    {
      slotRange,
      majorUnit,
      activeRange: dateProfile.activeRange,
    },
  )
}

export function buildDayColsFromSeries(
  daySeries: DaySeriesModel,
  dateEnv: DateEnv,
  config: BuildDayColsConfig = {},
): DayCol[] {
  const { slotRange, majorUnit = '', activeRange } = config

  return daySeries.dates.map((date) => ({
    key: date.toISOString(),
    date,
    range: slotRange
      ? {
          start: dateEnv.add(date, slotRange.slotMinTime),
          end: dateEnv.add(date, slotRange.slotMaxTime),
        }
      : {
          start: date,
          end: addDays(date, 1),
        },
    isMajor: majorUnit ? isMajorUnit(date, majorUnit, dateEnv) : false,
    isDisabled: activeRange === null || (
      activeRange !== undefined && !rangeContainsMarker(activeRange, date)
    ),
  }))
}
