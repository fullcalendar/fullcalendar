import { DaySeriesModel } from '../common/DaySeriesModel'
import { DateRange } from '@full-ui/headless-calendar'
import { Slicer } from '../common/slicing-utils'
import { DayTableModel, DayGridRange, buildDayGridRanges } from './DayTableModel'

export class DayTableSlicer extends Slicer<DayGridRange, [DayTableModel]> {
  forceDayIfListItem = true

  sliceRange(dateRange: DateRange, dayTableModel: DayTableModel): DayGridRange[] {
    return buildDayGridRanges(dayTableModel.daySeries.sliceRange(dateRange), dayTableModel.colCount)
  }
}

export class DaySeriesSlicer extends Slicer<DayGridRange, [DaySeriesModel]> {
  forceDayIfListItem = true

  sliceRange(dateRange: DateRange, daySeries: DaySeriesModel): DayGridRange[] {
    return buildDayGridRanges(daySeries.sliceRange(dateRange), daySeries.cnt)
  }
}
