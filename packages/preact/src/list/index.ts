import { PluginInput } from '../plugin-system-struct'
import { ListView } from './components/ListView'

export default {
  name: 'list',
  views: {
    list: {
      component: ListView,
      buttonTextKey: 'listText', // what to lookup in locale files
      disallowAmbigTitle: true,
    },
    listDay: {
      type: 'list',
      duration: { days: 1 },
    },
    listWeek: {
      type: 'list',
      duration: { weeks: 1 },
    },
    listMonth: {
      type: 'list',
      duration: { month: 1 },
    },
    listYear: {
      type: 'list',
      duration: { year: 1 },
    },
  },
} as PluginInput
