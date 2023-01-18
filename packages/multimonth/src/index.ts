import { createPlugin, PluginDef } from '@fullcalendar/core'
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
    },
    multiMonthYear: {
      type: 'multiMonth',
      duration: { years: 1 },
    },
  },
}) as PluginDef
