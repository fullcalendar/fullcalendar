
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
      start: calendar.dateEnv.toDate(this.unzonedRange.start),
      end: calendar.dateEnv.toDate(this.unzonedRange.end)
    }
  }

}
