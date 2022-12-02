import { createPlugin, PluginDef } from '@fullcalendar/core'
import { ListView } from './ListView.js'
import { OPTION_REFINERS } from './option-refiners.js'
import './ambient.js'
import './index.css'

export default createPlugin({
  name: '<%= pkgName %>',
  optionRefiners: OPTION_REFINERS,
  views: {
    list: {
      component: ListView,
      buttonTextKey: 'list', // what to lookup in locale files
      listDayFormat: { month: 'long', day: 'numeric', year: 'numeric' }, // like "January 1, 2016"
    },
    listDay: {
      type: 'list',
      duration: { days: 1 },
      listDayFormat: { weekday: 'long' }, // day-of-week is all we need. full date is probably in headerToolbar
    },
    listWeek: {
      type: 'list',
      duration: { weeks: 1 },
      listDayFormat: { weekday: 'long' }, // day-of-week is more important
      listDaySideFormat: { month: 'long', day: 'numeric', year: 'numeric' },
    },
    listMonth: {
      type: 'list',
      duration: { month: 1 },
      listDaySideFormat: { weekday: 'long' }, // day-of-week is nice-to-have
    },
    listYear: {
      type: 'list',
      duration: { year: 1 },
      listDaySideFormat: { weekday: 'long' }, // day-of-week is nice-to-have
    },
  },
}) as PluginDef

export * from './public-types.js'
