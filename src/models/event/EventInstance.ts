
export default class EventInstance {

  def: any // EventDef
  dateProfile: any // EventDateProfile


  constructor(def, dateProfile) {
    this.def = def
    this.dateProfile = dateProfile
  }


  toLegacy(calendar) {
    const dateEnv = calendar.dateEnv
    let dateProfile = this.dateProfile
    let obj = this.def.toLegacy()

    obj.isAllDay = dateProfile.isAllDay
    obj.start = dateEnv.toDate(dateProfile.unzonedRange.start)
    obj.end = dateProfile.hasEnd ?
      dateEnv.toDate(dateProfile.unzonedRange.end) :
      null

    return obj
  }

}
