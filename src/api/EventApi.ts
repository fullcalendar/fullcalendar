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

  get start(): Date | null {
    return this.instance ?
      this.calendar.dateEnv.toDate(this.instance.range.start) :
      null
  }

  get end(): Date | null {
    return (this.instance && this.def.hasEnd) ?
      this.calendar.dateEnv.toDate(this.instance.range.end) :
      null
  }

  // computable props that all access the def
  // TODO: find a TypeScript-compatible way to do this at scale
  get id(): string { return this.def.publicId }
  get groupId(): string { return this.def.groupId }
  get isAllDay(): boolean { return this.def.isAllDay }
  get title(): string { return this.def.title }
  get url(): string { return this.def.url }
  get startEditable(): boolean { return this.def.startEditable }
  get durationEditable(): boolean { return this.def.durationEditable }
  get constraint(): any { return this.def.constraint }
  get overlap(): any { return this.def.overlap }
  get rendering(): string { return this.def.rendering }
  get classNames(): string[] { return this.def.classNames }
  get backgroundColor(): string { return this.def.backgroundColor }
  get borderColor(): string { return this.def.borderColor }
  get textColor(): string { return this.def.textColor }

  // NOTE: user can't modify extendedProps because Object.freeze was called in event-def parsing
  get extendedProps(): any { return this.def.extendedProps }

}
