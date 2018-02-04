
export default class EventFootprint {

  componentFootprint: any
  eventDef: any
  eventInstance: any // optional


  constructor(componentFootprint, eventDef, eventInstance) {
    this.componentFootprint = componentFootprint
    this.eventDef = eventDef

    if (eventInstance) {
      this.eventInstance = eventInstance
    }
  }


  getEventLegacy() {
    return (this.eventInstance || this.eventDef).toLegacy()
  }

}
