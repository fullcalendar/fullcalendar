import { createPlugin, PluginDef } from '@fullcalendar/core'
import { TableDateProfileGenerator } from '@fullcalendar/daygrid/internal'
import { MultiMonthView } from './MultiMonthView.js'
import { OPTION_REFINERS } from './options-refiners.js'
import './ambient.js'
import './index.css'

export default createPlugin({
  name: '<%= pkgName %>',
  initialView: 'multiMonthYear',
  optionRefiners: OPTION_REFINERS,
  views: {
    multiMonth: {
      component: MultiMonthView,
      dateProfileGeneratorClass: TableDateProfileGenerator,
      multiMonthMinWidth: 350,
      multiMonthMaxColumns: 3,
    },
    multiMonthYear: {
      type: 'multiMonth',
      duration: { years: 1 },
      fixedWeekCount: true,
      showNonCurrentDates: false,
    },
  },
}) as PluginDef
