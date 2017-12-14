
/*
Meant to be immutable
*/
export default class ComponentFootprint {

  unzonedRange: any
  isAllDay: boolean = false // component can choose to ignore this


  constructor(unzonedRange, isAllDay) {
    this.unzonedRange = unzonedRange
    this.isAllDay = isAllDay
  }


  /*
  Only works for non-open-ended ranges.
  */
  toLegacy(calendar) {
    return {
      start: calendar.msToMoment(this.unzonedRange.startMs, this.isAllDay),
      end: calendar.msToMoment(this.unzonedRange.endMs, this.isAllDay)
    }
  }

}
