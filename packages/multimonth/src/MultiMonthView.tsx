import {
  DateComponent,
  ViewProps,
  ViewContainer,
  DateProfile,
  intersectRanges,
  DateMarker,
  DateEnv,
  createDuration,
  memoize,
  DateFormatter,
  createFormatter,
  isPropsEqual,
} from '@fullcalendar/core/internal'
import { buildDayTableRenderRange } from '@fullcalendar/daygrid/internal'
import { createElement, createRef } from '@fullcalendar/core/preact'
import { SingleMonth } from './SingleMonth.js'

interface MultiMonthViewState {
  clientWidth?: number
  clientHeight?: number
}

export class MultiMonthView extends DateComponent<ViewProps, MultiMonthViewState> {
  private splitDateProfileByMonth = memoize(splitDateProfileByMonth)
  private buildMonthFormat = memoize(buildMonthFormat)
  private elRef = createRef<HTMLElement>()

  render() {
    const { context, props } = this
    const { options, dateEnv } = context
    // const { multiMonthColumns, multiMonthColumnMinWidth } = options
    const monthDateProfiles = this.splitDateProfileByMonth(
      props.dateProfile,
      context.dateEnv,
      options.fixedWeekCount,
    )
    const monthFormat = this.buildMonthFormat(options.multiMonthFormat, monthDateProfiles)

    return (
      <ViewContainer
        elRef={this.elRef}
        elClasses={['fc-multimonth']}
        viewSpec={context.viewSpec}
      >
        {monthDateProfiles.map((monthDateProfile) => {
          const monthStart = monthDateProfile.currentRange.start
          return (
            <div
              key={monthStart.toISOString()}
              className="fc-multimonth-month"
            >
              <div>{dateEnv.format(monthStart, monthFormat)}</div>
              <SingleMonth
                {...props}
                dateProfile={monthDateProfile}
                clientWidth={this.state.clientWidth}
                clientHeight={this.state.clientHeight}
              />
            </div>
          )
        })}
      </ViewContainer>
    )
  }

  componentDidMount(): void {
    setTimeout(() => { // workaround for flushSync issue
      this.updateSize()
      this.context.addResizeHandler(this.handleSizing)
    })
  }

  componentDidUpdate(prevProps: ViewProps) {
    if (!isPropsEqual(prevProps, this.props)) { // an external change?
      this.handleSizing(false)
    }
  }

  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleSizing)
  }

  handleSizing = (isForced: boolean) => {
    if (isForced) {
      this.updateSize()
    }
  }

  updateSize() {
    const el = this.elRef.current
    if (el) {
      this.setState({
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
      })
    }
  }
}

const oneMonthDuration = createDuration(1, 'month')

function splitDateProfileByMonth(
  dateProfile: DateProfile,
  dateEnv: DateEnv,
  fixedWeekCount?: boolean,
): DateProfile[] {
  const { start, end } = dateProfile.currentRange
  let monthStart: DateMarker = start
  const monthDateProfiles: DateProfile[] = []

  while (monthStart.valueOf() < end.valueOf()) {
    const monthEnd = dateEnv.add(monthStart, oneMonthDuration)
    const currentRange = { start: monthStart, end: monthEnd }
    const renderRange = buildDayTableRenderRange({
      currentRange,
      snapToWeek: true,
      fixedWeekCount,
      dateEnv,
    })

    monthDateProfiles.push({
      currentRange,
      currentRangeUnit: 'month',
      isRangeAllDay: true,
      validRange: intersectRanges(dateProfile.validRange, renderRange),
      activeRange: dateProfile.activeRange ? intersectRanges(dateProfile.activeRange, renderRange) : null,
      renderRange,
      slotMinTime: dateProfile.slotMaxTime,
      slotMaxTime: dateProfile.slotMinTime,
      isValid: dateProfile.isValid,
      dateIncrement: dateProfile.dateIncrement,
    })

    monthStart = monthEnd
  }

  return monthDateProfiles
}

const YEAR_MONTH_FORMATTER = createFormatter({ year: 'numeric', month: 'long' })
const YEAR_FORMATTER = createFormatter({ month: 'long' })

function buildMonthFormat(
  formatOverride: DateFormatter | undefined,
  monthDateProfiles: DateProfile[],
): DateFormatter {
  return formatOverride ||
    ((monthDateProfiles[0].currentRange.start.getUTCFullYear() !==
      monthDateProfiles[monthDateProfiles.length - 1].currentRange.start.getUTCFullYear())
      ? YEAR_MONTH_FORMATTER
      : YEAR_FORMATTER)
}
