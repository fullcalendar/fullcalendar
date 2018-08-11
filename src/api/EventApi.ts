import Calendar from '../Calendar'
import { EventDef, EventInstance } from '../structs/event'

export default class EventApi {

  calendar: Calendar
  def: EventDef
  instance: EventInstance

  constructor(calendar: Calendar, def: EventDef, instance?: EventInstance) {
    this.calendar = calendar
    this.def = def
    this.instance = instance || null
  }

  updateProp(name: string, val: string) {
    let { instance } = this

    if (instance) {
      if (name.match(/^(start|end|date|isAllDay)$/)) {
        // error. date-related props need other methods
      } else {
        let props

        if (name === 'color') { // TODO: consolidate this logic with event struct?
          props = { backgroundColor: val, borderColor: val }
        } else {
          props = { [name]: val }
        }

        this.calendar.dispatch({
          type: 'MUTATE_EVENTS',
          instanceId: instance.instanceId,
          mutation: {
            standardProps: props
          }
        })
      }
    }
  }

  updateExtendedProp(name: string, val: string) {
    let { instance } = this

    if (instance) {
      this.calendar.dispatch({
        type: 'MUTATE_EVENTS',
        instanceId: instance.instanceId,
        mutation: {
          extendedProps: { [name]: val }
        }
      })
    }
  }

  remove() {
    let { instance } = this

    if (instance) {
      this.calendar.dispatch({
        type: 'REMOVE_EVENT_INSTANCES',
        instances: { [instance.instanceId]: instance }
      })
    }
  }

}
