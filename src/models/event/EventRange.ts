
export default class EventRange {

  unzonedRange: any
  eventDef: any
  eventInstance: any // optional


  constructor(unzonedRange, eventDef, eventInstance?) {
    this.unzonedRange = unzonedRange
    this.eventDef = eventDef

    if (eventInstance) {
      this.eventInstance = eventInstance
    }
  }

}
