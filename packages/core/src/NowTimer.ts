import { DateMarker, addMs } from './datelib/marker'
import { createDuration } from './datelib/duration'
import { SubRenderer } from './vdom-util'
import ComponentContext from './component/ComponentContext'


export interface NowTimerProps {
  enabled: boolean
  unit: string
  callback: NowTimerCallback
}

export type NowTimerCallback = (now: DateMarker) => void


export default class NowTimer extends SubRenderer {

  private timeoutId: any
  private intervalId: any


  render(props: NowTimerProps, context: ComponentContext) {

    if (!props.enabled) {
      return
    }

    let { dateEnv } = context
    let { unit, callback } = props
    let initialNowDate = context.calendar.getNow()
    let initialNowQueriedMs = new Date().valueOf()

    function update() {
      callback(addMs(initialNowDate, new Date().valueOf() - initialNowQueriedMs))
    }

    update()

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


  unrender() {
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
