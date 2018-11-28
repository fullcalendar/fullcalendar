import { createPlugin, PluginDef } from '../plugin-system'
import BasicView from './BasicView'

let plugin: PluginDef = createPlugin({
  viewConfigs: {

    basic: BasicView,

    basicDay: {
      type: 'basic',
      duration: { days: 1 }
    },

    basicWeek: {
      type: 'basic',
      duration: { weeks: 1 }
    },

    month: {
      type: 'basic',
      monthMode: true,
      duration: { months: 1 }, // important for prev/next
      fixedWeekCount: true
    }

  }
})

export default plugin // done for .d.ts bug :(
