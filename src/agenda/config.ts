import { createPlugin, PluginDef } from '../plugin-system'
import AgendaView from './AgendaView'

let plugin: PluginDef = createPlugin({
  viewConfigs: {

    agenda: {
      class: AgendaView,
      allDaySlot: true,
      slotDuration: '00:30:00',
      slotEventOverlap: true // a bad name. confused with overlap/constraint system
    },

    agendaDay: {
      type: 'agenda',
      duration: { days: 1 }
    },

    agendaWeek: {
      type: 'agenda',
      duration: { weeks: 1 }
    }

  }
})

export default plugin // done for .d.ts bug :(
