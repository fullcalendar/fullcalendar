import Calendar from '../Calendar'
import View from '../View'
import Theme from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { parseFieldSpecs } from '../util/misc'
import { createDuration, Duration } from '../datelib/duration'


export default interface ComponentContext {
  calendar: Calendar
  view?: View
  dateEnv: DateEnv
  theme: Theme
  options: any
  isRtl: boolean
  eventOrderSpecs: any
  nextDayThreshold: Duration
}


export function buildComponentContext(
  calendar: Calendar,
  theme: Theme,
  dateEnv: DateEnv,
  options: any,
  view?: View
): ComponentContext {
  return {
    calendar,
    view,
    dateEnv,
    theme,
    options,
    isRtl: options.dir === 'rtl',
    eventOrderSpecs: parseFieldSpecs(options.eventOrder),
    nextDayThreshold: createDuration(options.nextDayThreshold)
  }
}


export function extendComponentContext(context: ComponentContext, options?: any, view?: View): ComponentContext {
  return buildComponentContext(
    context.calendar,
    context.theme,
    context.dateEnv,
    options || context.options,
    view || context.view
  )
}
