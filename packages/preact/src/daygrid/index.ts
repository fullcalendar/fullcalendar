import { PluginInput } from '../plugin-system-struct'
import { DayGridView } from './components/DayGridView'
import { TableDateProfileGenerator } from './TableDateProfileGenerator'

export default {
  name: 'daygrid',
  initialView: 'dayGridMonth',
  views: {
    dayGrid: {
      component: DayGridView,
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
} as PluginInput
