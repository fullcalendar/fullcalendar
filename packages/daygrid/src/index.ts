import { createPlugin } from '@fullcalendar/core'
import { DayTableView } from './DayTableView.js'
import { TableDateProfileGenerator } from './TableDateProfileGenerator.js'
import './index.css'

export { DayTable } from './DayTable.js'
export { DayTableSlicer } from './DayTableSlicer.js'
export { Table } from './Table.js'
export { TableSeg } from './TableSeg.js'
export { TableView } from './TableView.js'
export { buildDayTableModel } from './DayTableView.js'
export { DayTableView as DayGridView } // export as old name!

export default createPlugin({
  name: '<%= pkgName %>',
  initialView: 'dayGridMonth',
  views: {
    dayGrid: {
      component: DayTableView,
      dateProfileGeneratorClass: TableDateProfileGenerator,
    },
    dayGridDay: {
      type: 'dayGrid',
      duration: { days: 1 },
    },
    dayGridWeek: {
      type: 'dayGrid',
      duration: { weeks: 1 },
    },
    dayGridMonth: {
      type: 'dayGrid',
      duration: { months: 1 },
      monthMode: true,
      fixedWeekCount: true,
    },
  },
})
