import Calendar from '../Calendar'
import View from '../View'
import Theme from '../theme/Theme'
import { DateEnv } from '../datelib/env'
import { parseFieldSpecs } from '../util/misc'
import { createDuration, Duration } from '../datelib/duration'


export default class ComponentContext {

  isRtl: boolean
  eventOrderSpecs: any
  nextDayThreshold: Duration

  // TODO: move plugin system into here

  constructor(
    public calendar: Calendar,
    public theme: Theme,
    public dateEnv: DateEnv,
    public options: any,
    public view?: View
  ) {
    this.isRtl = options.dir === 'rtl'
    this.eventOrderSpecs = parseFieldSpecs(options.eventOrder)
    this.nextDayThreshold = createDuration(options.nextDayThreshold)
  }

  extend(options?: any, view?: View) {
    return new ComponentContext(
      this.calendar,
      this.theme,
      this.dateEnv,
      options || this.options,
      view || this.view
    )
  }

}
