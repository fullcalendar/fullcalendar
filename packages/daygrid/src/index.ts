import { createPlugin, PluginDef } from '@fullcalendar/core/internal'
import { DayTableView } from './DayTableView.js'
import { TableDateProfileGenerator } from './TableDateProfileGenerator.js'
import './index.css'

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
}) as PluginDef
