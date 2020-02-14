
import './lib/global-test-utils'
import './lib/hacks'
import './lib/simulate'
import './lib/date-matchers'
import './main.css'

import InteractionPlugin from '@fullcalendar/interaction'
import DayGridPlugin from '@fullcalendar/daygrid'
import TimeGridPlugin from '@fullcalendar/timegrid'
import ListPlugin from '@fullcalendar/list'

export const DEFAULT_PLUGINS = [
  InteractionPlugin,
  DayGridPlugin,
  TimeGridPlugin,
  ListPlugin
]

pushOptions({
  timeZone: 'UTC',
  plugins: DEFAULT_PLUGINS
})

// all of the non-lib .js files within subdirectories will be automatically included...
