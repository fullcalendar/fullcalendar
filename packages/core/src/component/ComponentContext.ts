import Calendar from '../Calendar'
import View from '../View'
import Theme from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { parseFieldSpecs } from '../util/misc'
import { createDuration, Duration } from '../datelib/duration'
import { PluginHooks } from '../plugin-system'


export default interface ComponentContext {
  calendar: Calendar
  pluginHooks: PluginHooks
  view?: View
  dateEnv: DateEnv
  theme: Theme
  options: any
  isRtl: boolean
  eventOrderSpecs: any
  nextDayThreshold: Duration
}


export function computeContextProps(options: any) {
  return {
    isRtl: options.dir === 'rtl',
    eventOrderSpecs: parseFieldSpecs(options.eventOrder),
    nextDayThreshold: createDuration(options.nextDayThreshold)
  }
}
