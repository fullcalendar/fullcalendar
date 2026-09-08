import { DaySeriesModel } from '../common/DaySeriesModel'
import { DateMarker, DateEnv, DateRange, rangeContainsMarker } from '@full-ui/headless-calendar'
import { Dictionary } from '../options'
import { SlicedCoordRange } from '../coord-range'
import { isMajorUnit } from '../DateProfileGenerator'

export interface DayGridRange extends SlicedCoordRange {
  row: number
  // `start` is start-COLUMN
  // `end` is end-COLUMN
}

/*
TODO: DRY-up these types and utils with header-tier
*/
export interface DayTableCell {
  key: string // probably just the serialized date, but could be other metadata if this col is specific to another entity
  date: DateMarker
  isMajor: boolean
  isDisabled: boolean
  renderProps?: Dictionary
  attrs?: Dictionary
  className?: string
  dateSpanProps?: Dictionary
}

export class DayTableModel {
  rowCount: number
  colCount: number
  cellRows: DayTableCell[][]
  headerDates: DateMarker[]

  constructor(
    public daySeries: DaySeriesModel,
    breakOnWeeks: boolean,
    private dateEnv: DateEnv,
    private majorUnit = '',
    private activeRange?: DateRange | null,
  ) {
    let { dates } = daySeries
    let daysPerRow: number
    let firstDay: number
    let rowCount: number

    if (breakOnWeeks) {
      // count columns until the day-of-week repeats
      firstDay = dates[0].getUTCDay()
      for (daysPerRow = 1; daysPerRow < dates.length; daysPerRow += 1) {
        if (dates[daysPerRow].getUTCDay() === firstDay) {
          break
        }
      }
      rowCount = Math.ceil(dates.length / daysPerRow)
    } else {
      rowCount = 1
      daysPerRow = dates.length
    }

    this.rowCount = rowCount
    this.colCount = daysPerRow
    this.cellRows = this.buildCells()
    this.headerDates = this.buildHeaderDates()
  }

  public buildCells() {
    let rows = []

    for (let row = 0; row < this.rowCount; row += 1) {
      let cells = []

      for (let col = 0; col < this.colCount; col += 1) {
        cells.push(
          this.buildCell(row, col),
        )
      }

      rows.push(cells)
    }

    return rows
  }

  private buildCell(row, col): DayTableCell {
    let date = this.daySeries.dates[row * this.colCount + col]

    return {
      key: date.toISOString(),
      date,
      isMajor: this.cellIsMajor(date),
      isDisabled: this.activeRange === null || (
        this.activeRange !== undefined && !rangeContainsMarker(this.activeRange, date)
      ),
    }
  }

  protected cellIsMajor(dateMarker: DateMarker): boolean {
    return this.majorUnit ? isMajorUnit(dateMarker, this.majorUnit, this.dateEnv) : false
  }

  private buildHeaderDates() {
    let dates = []

    for (let col = 0; col < this.colCount; col += 1) {
      dates.push(this.cellRows[0][col].date)
    }

    return dates
  }
}

export function buildDayGridRanges(
  seriesRange: SlicedCoordRange | null,
  daysPerRow: number,
): DayGridRange[] {
  let ranges: DayGridRange[] = []

  if (seriesRange) {
    const { start, end } = seriesRange
    let index = start

    while (index < end) {
      let row = Math.floor(index / daysPerRow)
      let nextIndex = Math.min((row + 1) * daysPerRow, end)

      ranges.push({
        row,
        start: index % daysPerRow,
        end: (nextIndex - 1) % daysPerRow + 1,
        isStart: seriesRange.isStart && index === start,
        isEnd: seriesRange.isEnd && nextIndex === end,
      })

      index = nextIndex
    }
  }

  return ranges
}
