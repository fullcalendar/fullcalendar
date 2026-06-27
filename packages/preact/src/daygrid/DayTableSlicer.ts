import { DayTableModel, DayGridRange } from '../common/DayTableModel'
import { DateRange } from '@full-ui/headless-calendar'
import { Slicer } from '../common/slicing-utils'

export class DayTableSlicer extends Slicer<DayGridRange, [DayTableModel]> {
  forceDayIfListItem = true

  sliceRange(dateRange: DateRange, dayTableModel: DayTableModel): DayGridRange[] {
    return dayTableModel.sliceRange(dateRange)
  }
}
