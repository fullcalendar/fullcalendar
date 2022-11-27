import { DayTableModel, DateRange, Slicer } from '@fullcalendar/core/internal'
import { TableSeg } from './TableSeg.js'

export class DayTableSlicer extends Slicer<TableSeg, [DayTableModel]> {
  forceDayIfListItem = true

  sliceRange(dateRange: DateRange, dayTableModel: DayTableModel): TableSeg[] {
    return dayTableModel.sliceRange(dateRange)
  }
}
