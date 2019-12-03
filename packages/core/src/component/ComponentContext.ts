import Calendar from '../Calendar'
import ViewApi from '../ViewApi'
import Theme from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { parseFieldSpecs } from '../util/misc'
import { createDuration, Duration } from '../datelib/duration'
import { PluginHooks } from '../plugin-system'
import { createContext } from '../vdom'
import { parseToolbars, ToolbarModel } from '../toolbar-parse'


export const ComponentContextType = createContext({}) // for Components


export default interface ComponentContext {
  calendar: Calendar
  pluginHooks: PluginHooks
  dateEnv: DateEnv
  theme: Theme
  view: ViewApi
  options: any
  isRtl: boolean
  eventOrderSpecs: any
  nextDayThreshold: Duration
  header: ToolbarModel | null
  footer: ToolbarModel | null
  viewsWithButtons: string[]
}


export function buildContext(
  calendar: Calendar,
  pluginHooks: PluginHooks,
  dateEnv: DateEnv,
  theme: Theme,
  view: ViewApi,
  options: any
): ComponentContext {
  return {
    calendar,
    pluginHooks,
    dateEnv,
    theme,
    view,
    options,
    ...computeContextProps(options, theme, calendar)
  }
}


function computeContextProps(options: any, theme: Theme, calendar: Calendar) {
  return {
    isRtl: options.dir === 'rtl',
    eventOrderSpecs: parseFieldSpecs(options.eventOrder),
    nextDayThreshold: createDuration(options.nextDayThreshold),
    ...parseToolbars(options, theme, calendar)
  }
}
