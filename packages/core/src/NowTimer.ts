import { DateMarker, addMs } from './datelib/marker'
import { createDuration } from './datelib/duration'
import { DateEnv } from './datelib/env'


export type NowTimerCallback = (now: DateMarker) => void


export default class NowTimer {

  private timeoutId: any
  private intervalId: any


  constructor(initialNowDate: DateMarker, unit: string, dateEnv: DateEnv, callback: NowTimerCallback) {
    let initialNowQueriedMs = new Date().valueOf()

    function update() {
      callback(addMs(initialNowDate, new Date().valueOf() - initialNowQueriedMs))
    }

    // wait until the beginning of the next interval
    let delay = dateEnv.add(
      dateEnv.startOf(initialNowDate, unit),
      createDuration(1, unit)
    ).valueOf() - initialNowDate.valueOf()

    // TODO: maybe always use setTimeout, waiting until start of next unit
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null
      update()

      if (unit === 'second') {
        delay = 1000 // every second
      } else {
        delay = 1000 * 60 // otherwise, every minute
      }

      this.intervalId = setInterval(update, delay) // update every interval
    }, delay)
  }


  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

}
