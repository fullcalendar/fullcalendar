import { removeExact } from '../util/array'
import Calendar from '../Calendar'

let activeCalendars = []

export default {

  registerCalendar(calendar: Calendar) {
    activeCalendars.push(calendar)

    if (activeCalendars.length === 1) {
      this.bind()
    }
  },

  unregisterCalendar(calendar: Calendar) {
    if (
      removeExact(activeCalendars, calendar) && // any removed?
      !activeCalendars.length // no more left
    ) {
      this.unbind()
    }
  },

  bind() {
  },

  unbind() {
  }

}
