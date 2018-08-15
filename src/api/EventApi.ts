import Calendar from '../Calendar'
import { EventDef, EventInstance } from '../structs/event'
import { EventMutation } from '../structs/event-mutation'

export default class EventApi {

  calendar: Calendar
  def: EventDef
  instance: EventInstance

  constructor(calendar: Calendar, def: EventDef, instance?: EventInstance) {
    this.calendar = calendar
    this.def = def
    this.instance = instance || null
  }

  setProp(name: string, val: string) {
    if (name.match(/^(start|end|date|isAllDay)$/)) {
      // error. date-related props need other methods
    } else {
      let props

      // TODO: consolidate this logic with event struct?
      if (name === 'editable') {
        props = { startEditable: val, durationEditable: val }
      } else if (name === 'color') {
        props = { backgroundColor: val, borderColor: val }
      } else {
        props = { [name]: val }
      }

      this.mutate({
        standardProps: props
      })
    }
  }

  setExtendedProp(name: string, val: string) {
    this.mutate({
      extendedProps: { [name]: val }
    })
  }

  private mutate(mutation: EventMutation) {
    let { instance } = this

    if (instance) {
      this.calendar.dispatch({
        type: 'MUTATE_EVENTS',
        instanceId: instance.instanceId,
        mutation
      })

      let eventStore = this.calendar.state.eventStore
      this.def = eventStore.defs[this.def.defId]
      this.instance = eventStore.instances[this.instance.instanceId]
    }
  }

  remove() {
    this.calendar.dispatch({
      type: 'REMOVE_EVENT_DEF',
      defId: this.def.defId
    })
  }

  get title(): string {
    return this.def.title
  }

  get start(): Date {
    return this.calendar.dateEnv.toDate(this.instance.range.start)
  }

  get end(): Date {
    return this.def.hasEnd ?
      this.calendar.dateEnv.toDate(this.instance.range.end) :
      null
  }

}
