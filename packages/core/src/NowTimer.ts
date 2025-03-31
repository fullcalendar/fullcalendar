import { DateMarker, startOfDay, addDays } from './datelib/marker.js'
import { createDuration } from './datelib/duration.js'
import { ViewContext, ViewContextType } from './ViewContext.js'
import { ComponentChildren, Component } from './preact.js'
import { DateRange } from './datelib/date-range.js'
import { getNowDate } from './reducers/current-date.js'

export interface NowTimerProps {
  unit: string // TODO: add type of unit
  children: (now: DateMarker, todayRange: DateRange) => ComponentChildren
}

interface NowTimerState {
  nowDate: DateMarker
  todayRange: DateRange
}

export class NowTimer extends Component<NowTimerProps, NowTimerState> {
  static contextType: any = ViewContextType
  context: ViewContext // do this for all components that use the context!!!
  timeoutId: any

  constructor(props: NowTimerProps, context: ViewContext) {
    super(props, context)
    this.state = this.computeTiming().state
  }

  render() {
    let { props, state } = this
    return props.children(state.nowDate, state.todayRange)
  }

  componentDidMount() {
    this.setTimeout()

    // fired tab becomes visible after being hidden
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  componentDidUpdate(prevProps: NowTimerProps) {
    if (prevProps.unit !== this.props.unit) {
      this.clearTimeout()
      this.setTimeout()
    }
  }

  componentWillUnmount() {
    this.clearTimeout()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  }

  private computeTiming() {
    let { props, context } = this
    let unroundedNow = getNowDate(context)
    let currentUnitStart = context.dateEnv.startOf(unroundedNow, props.unit)
    let nextUnitStart = context.dateEnv.add(currentUnitStart, createDuration(1, props.unit))
    let waitMs = nextUnitStart.valueOf() - unroundedNow.valueOf()

    // there is a max setTimeout ms value (https://stackoverflow.com/a/3468650/96342)
    // ensure no longer than a day
    waitMs = Math.min(1000 * 60 * 60 * 24, waitMs)

    return {
      state: { nowDate: currentUnitStart, todayRange: buildDayRange(currentUnitStart) } as NowTimerState,
      waitMs,
    }
  }

  private setTimeout(timing = this.computeTiming()) {
    let { waitMs } = timing

    // NOTE: timeout could take longer than expected if tab sleeps,
    // which is why we listen to 'visibilitychange'
    this.timeoutId = setTimeout(() => {
      this.setState(this.computeTiming().state, () => {
        this.setTimeout()
      })
    }, waitMs)
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  private refreshTimeout() {
    let timing = this.computeTiming()

    if (timing.state.todayRange.start.valueOf() !== this.state.todayRange.start.valueOf()) {
      this.setState(timing.state)
    }

    this.clearTimeout()
    this.setTimeout(timing)
  }

  private handleVisibilityChange = () => {
    if (!document.hidden) {
      this.refreshTimeout()
    }
  }
}

function buildDayRange(date: DateMarker): DateRange { // TODO: make this a general util
  let start = startOfDay(date)
  let end = addDays(start, 1)

  return { start, end }
}
