import { DateProfileGenerator } from '../DateProfileGenerator'
import { DateMarker, addDays, diffDays, DateRange } from '@full-ui/headless-calendar'
import { SlicedCoordRange } from '../coord-range'

/*
A hidden day occupies a slot in `entries` (so a date can still be located by its offset from
range.start) but owns no index in `dates`. It records the visible indices on either side of
it, which is how sliceRange clamps a span whose endpoint lands on a hidden day inward to the
nearest rendered column.
*/
type DaySeriesEntry =
  { kind: 'visible', index: number } |
  { kind: 'hidden', previousIndex: number, nextIndex: number }

type DayIndexResult =
  DaySeriesEntry |
  { kind: 'before', index: -1 } |
  { kind: 'after', index: number }

export class DaySeriesModel {
  cnt: number
  dates: DateMarker[] // whole-day dates for each column. left to right

  private rangeStart: DateMarker
  private entries: DaySeriesEntry[]

  constructor(range: DateRange, dateProfileGenerator: DateProfileGenerator) {
    let date: DateMarker = range.start
    let { end } = range
    let entries: DaySeriesEntry[] = []
    let dates: DateMarker[] = []
    let dayIndex = -1

    while (date < end) { // loop each day from start to end
      if (dateProfileGenerator.isHiddenDay(date)) {
        entries.push({
          kind: 'hidden',
          previousIndex: dayIndex,
          nextIndex: dayIndex + 1,
        })
      } else {
        dayIndex += 1
        entries.push({ kind: 'visible', index: dayIndex })
        dates.push(date)
      }
      date = addDays(date, 1)
    }

    this.rangeStart = range.start
    this.dates = dates
    this.entries = entries
    this.cnt = dates.length
  }

  sliceRange(range: DateRange): SlicedCoordRange | null {
    let firstResult = this.getDateIndex(range.start)
    let lastResult = this.getDateIndex(addDays(range.end, -1))
    let firstIndex = getFirstVisibleIndex(firstResult)
    let lastIndex = getLastVisibleIndex(lastResult)

    let clippedFirstIndex = Math.max(0, firstIndex)
    let clippedLastIndex = Math.min(this.cnt - 1, lastIndex)

    if (clippedFirstIndex <= clippedLastIndex) {
      return {
        start: clippedFirstIndex,
        end: clippedLastIndex + 1, // make exclusive
        isStart: firstResult.kind === 'visible' && firstIndex === clippedFirstIndex,
        isEnd: lastResult.kind === 'visible' && lastIndex === clippedLastIndex,
      }
    }

    return null
  }

  private getDateIndex(date: DateMarker): DayIndexResult {
    let dayOffset = Math.floor(diffDays(this.rangeStart, date))

    if (dayOffset < 0) {
      return { kind: 'before', index: -1 }
    }

    if (dayOffset >= this.entries.length) {
      return { kind: 'after', index: this.cnt }
    }

    return this.entries[dayOffset]
  }
}

function getFirstVisibleIndex(result: DayIndexResult): number {
  return result.kind === 'hidden' ? result.nextIndex : result.index
}

function getLastVisibleIndex(result: DayIndexResult): number {
  return result.kind === 'hidden' ? result.previousIndex : result.index
}
