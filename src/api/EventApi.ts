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

}
