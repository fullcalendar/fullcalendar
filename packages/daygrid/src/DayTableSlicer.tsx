import { DayTableModel, DateRange, Slicer } from '@fullcalendar/common'
import { TableSeg } from './TableSeg'

export class DayTableSlicer extends Slicer<TableSeg, [DayTableModel]> {
  forceDayIfListItem = true

  sliceRange(dateRange: DateRange, dayTableModel: DayTableModel): TableSeg[] {
    return dayTableModel.sliceRange(dateRange)
  }
}
