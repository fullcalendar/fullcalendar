import { removeExact } from '../util/array'
import Calendar from '../Calendar'
import InteractiveDateComponent from '../component/InteractiveDateComponent'

let activeCalendars: Calendar[] = []
let activeComponents: InteractiveDateComponent[] = []

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

  registerComponent(component: InteractiveDateComponent) {
    activeComponents.push(component)
  },

  unregisterComponent(component: InteractiveDateComponent) {
    removeExact(activeComponents, component)
  },

  bind() {
    document.addEventListener('click', this.documentClick = function(ev) {
      for (let component of activeComponents) {
        component.buildCoordCaches()
        let hit = component.queryHit(ev.pageX, ev.pageY)
        if (hit) {
          console.log(
            hit.range.start.toUTCString(),
            hit.range.end.toUTCString(),
            hit.isAllDay
          )
        }
      }
    })
  },

  unbind() {
    document.removeEventListener('click', this.documentClick)
  }

}
