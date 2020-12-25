import { DateMarker, addMs, startOfDay, addDays } from './datelib/marker'
import { createDuration } from './datelib/duration'
import { ViewContext, ViewContextType } from './ViewContext'
import { ComponentChildren, Component } from './vdom'
import { DateRange } from './datelib/date-range'
import { getNow } from './reducers/current-date'

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
  initialNowDate: DateMarker
  initialNowQueriedMs: number
  timeoutId: any

  constructor(props: NowTimerProps, context: ViewContext) {
    super(props, context)

    this.initialNowDate = getNow(context.options.now, context.dateEnv)
    this.initialNowQueriedMs = new Date().valueOf()

    this.state = this.computeTiming().currentState
  }

  render() {
    let { props, state } = this
    return props.children(state.nowDate, state.todayRange)
  }

  componentDidMount() {
    this.setTimeout()
  }

  componentDidUpdate(prevProps: NowTimerProps) {
    if (prevProps.unit !== this.props.unit) {
      this.clearTimeout()
      this.setTimeout()
    }
  }

  componentWillUnmount() {
    this.clearTimeout()
  }

  private computeTiming() {
    let { props, context } = this
    let unroundedNow = addMs(this.initialNowDate, new Date().valueOf() - this.initialNowQueriedMs)
    let currentUnitStart = context.dateEnv.startOf(unroundedNow, props.unit)
    let nextUnitStart = context.dateEnv.add(currentUnitStart, createDuration(1, props.unit))
    let waitMs = nextUnitStart.valueOf() - unroundedNow.valueOf()

    // there is a max setTimeout ms value (https://stackoverflow.com/a/3468650/96342)
    // ensure no longer than a day
    waitMs = Math.min(1000 * 60 * 60 * 24, waitMs)

    return {
      currentState: { nowDate: currentUnitStart, todayRange: buildDayRange(currentUnitStart) } as NowTimerState,
      nextState: { nowDate: nextUnitStart, todayRange: buildDayRange(nextUnitStart) } as NowTimerState,
      waitMs,
    }
  }

  private setTimeout() {
    let { nextState, waitMs } = this.computeTiming()

    this.timeoutId = setTimeout(() => {
      this.setState(nextState, () => {
        this.setTimeout()
      })
    }, waitMs)
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }
}

function buildDayRange(date: DateMarker): DateRange { // TODO: make this a general util
  let start = startOfDay(date)
  let end = addDays(start, 1)

  return { start, end }
}
