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
  firstMonthHPadding?: number
}

const DEFAULT_COL_MIN_WIDTH = 350
const DEFAULT_COL_MAX_COUNT = 3

export class MultiMonthView extends DateComponent<ViewProps, MultiMonthViewState> {
  private splitDateProfileByMonth = memoize(splitDateProfileByMonth)
  private buildMonthFormat = memoize(buildMonthFormat)
  private elRef = createRef<HTMLDivElement>()
  private innerElRef = createRef<HTMLDivElement>()
  private firstMonthElRef = createRef<HTMLDivElement>()

  render() {
    const { context, props, state } = this
    const { options, dateEnv } = context
    const { clientWidth, clientHeight } = state

    const monthDateProfiles = this.splitDateProfileByMonth(
      props.dateProfile,
      context.dateEnv,
      options.fixedWeekCount,
    )
    const monthTitleFormat = this.buildMonthFormat(options.multiMonthTitleFormat, monthDateProfiles)

    const colMinWidth = options.multiMonthMinWidth || DEFAULT_COL_MIN_WIDTH
    const colMaxCnt = options.multiMonthMaxColumns || DEFAULT_COL_MAX_COUNT
    const colCount = Math.min(
      clientWidth != null ?
        Math.floor(clientWidth / (colMinWidth + (state.firstMonthHPadding || 0))) :
        1,
      colMaxCnt,
    )

    const monthWidthPct = (100 / colCount) + '%'
    const monthWidth = clientWidth != null ? (clientWidth / colCount) : null
    const monthHeight = monthWidth != null ? (monthWidth / options.aspectRatio) : null

    const rootClassNames = [
      'fc-multimonth',
      (clientWidth != null && colCount === 1) ?
        'fc-multimonth-singlecol' :
        '',
    ]
    const monthClassNames = [
      'fc-multimonth-month',
      (monthWidth != null && monthWidth < 400) ?
        'fc-multimonth-month-condensed' :
        '',
    ]

    return (
      <ViewContainer
        elRef={this.elRef}
        elClasses={rootClassNames}
        viewSpec={context.viewSpec}
      >
        <div ref={this.innerElRef}>
          {monthDateProfiles.map((monthDateProfile, i) => {
            const monthStart = monthDateProfile.currentRange.start
            return (
              <div
                key={monthStart.toISOString()}
                ref={i === 0 ? this.firstMonthElRef : undefined}
                className={monthClassNames.join(' ')}
                style={{ width: monthWidthPct }}
              >
                <div className="fc-multimonth-month-title">
                  {dateEnv.format(monthStart, monthTitleFormat)}
                </div>
                <SingleMonth
                  {...props}
                  dateProfile={monthDateProfile}
                  clientWidth={clientWidth}
                  clientHeight={clientHeight}
                  tableHeight={monthHeight}
                />
              </div>
            )
          })}
        </div>
      </ViewContainer>
    )
  }

  componentDidMount(): void {
    this.updateSize()
    this.context.addResizeHandler(this.handleSizing)
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
    const innerEl = this.innerElRef.current
    const firstMonthEl = this.firstMonthElRef.current

    if (el) {
      this.setState({
        clientHeight: el.clientHeight,
      })
    }

    if (innerEl) {
      this.setState({
        clientWidth: innerEl.offsetWidth, // within padding
      })
    }

    if (firstMonthEl) {
      if (!this.state.firstMonthHPadding) { // always remember initial non-zero value
        this.setState({
          firstMonthHPadding: firstMonthEl.offsetWidth -
            (firstMonthEl.querySelector('.fc-multimonth-daygrid-table') as HTMLElement).offsetWidth,
        })
      }
    }
  }

  // workaround for when queued setState render (w/ clientWidth) gets cancelled because
  // subsequent update and shouldComponentUpdate says not to render :(
  shouldComponentUpdate() {
    return true
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
