import { createPlugin, PluginDef } from '@fullcalendar/core'
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
      fixedWeekCount: true,
    },
    dayGridYear: {
      type: 'dayGrid',
      duration: { years: 1 },
    },
  },
}) as PluginDef
