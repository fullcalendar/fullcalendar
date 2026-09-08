import { DateMarker, DateRange } from '@full-ui/headless-calendar'
import { ViewContext, ViewContextType } from './ViewContext'
import { type ReactNode, Component } from 'react'
import { NowTimerRunner } from './NowTimerRunner'

export interface NowTimerProps {
  unit: string // TODO: add type of unit
  unitValue?: number // solely for nowIndicator:auto
  // nowMs is the exact instant of `now` — unlike the marker, unambiguous during DST transitions
  children?: (now: DateMarker, todayRange: DateRange, nowMs: number) => ReactNode
}

export class NowTimer extends Component<NowTimerProps> {
  static contextType: any = ViewContextType
  context: ViewContext
  private runner: NowTimerRunner

  constructor(props: NowTimerProps, context: ViewContext) {
    super(props, context)
    this.runner = new NowTimerRunner(this.handleChange)
  }

  render() {
    const { props, context } = this
    const { nowDate, nowMs, todayRange } = this.runner.update({
      nowManager: context.nowManager,
      unit: props.unit,
      unitValue: props.unitValue,
      nowIndicatorSnap: context.options.nowIndicatorSnap,
      dateEnv: context.dateEnv,
    })
    return props.children(nowDate, todayRange, nowMs)
  }

  componentWillUnmount() {
    this.runner.destroy()
  }

  private handleChange = () => {
    this.forceUpdate()
  }
}
