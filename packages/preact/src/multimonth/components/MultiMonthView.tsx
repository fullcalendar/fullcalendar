import { CssDimValue } from '../../scrollgrid/util'
import { joinClassNames } from '../../util/html'
import { DateComponent } from '../../component/DateComponent'
import { ViewProps } from '../../component-util/View'
import { ViewContainer } from '../../common/ViewContainer'
import { DateProfile, DateProfileGenerator } from '../../DateProfileGenerator'
import { intersectRanges, DateMarker, DateEnv, createDuration, DateFormatter, formatIsoMonthStr, DateRange } from '@full-ui/headless-calendar'
import { memoize } from '../../util/memoize'
import { createFormatter } from '../../datelib/formatting'
import { NowTimer } from '../../NowTimer'
import { getIsHeightAuto } from '../../scrollgrid/util'
import { Scroller } from '../../scrollgrid/Scroller'
import { fracToCssDim } from '../../util/html'
import classNames from '../../styles.module.css'
import { buildDayTableRenderRange } from '../../daygrid/TableDateProfileGenerator'
import { createRef } from 'react'
import { Ruler } from '../../scrollgrid/Ruler'
import { SingleMonth } from './SingleMonth'

interface MultiMonthViewState {
  innerWidth?: number
}

interface MultiMonthScrollState {
  date?: DateMarker
  top?: number
}

export class MultiMonthView extends DateComponent<ViewProps, MultiMonthViewState> {
  state = {} as MultiMonthViewState

  // memo
  private splitDateProfileByMonth = memoize(splitDateProfileByMonth)
  private buildMonthFormat = memoize(buildMonthFormat)

  // ref
  private scrollerRef = createRef<Scroller>()
  private tilesElRef = createRef<HTMLDivElement>()

  // internal
  private _isUnmounting: boolean
  private scrollState: MultiMonthScrollState = {}

  render() {
    const { context, props, state } = this
    const { options } = context
    const verticalScrolling = !props.forPrint && !getIsHeightAuto(options)

    const monthDateProfiles = this.splitDateProfileByMonth(
      context.dateProfileGenerator,
      props.dateProfile,
      context.dateEnv,
      options.fixedWeekCount,
      options.showNonCurrentDates,
    )

    const monthTitleFormat = this.buildMonthFormat(options.singleMonthTitleFormat, monthDateProfiles)

    const { multiMonthMaxColumns, singleMonthMinWidth } = options
    const { innerWidth } = state

    let cols: number | undefined
    let cssMonthWidth: CssDimValue | undefined
    let hasLateralSiblings = false

    if (innerWidth != null) {
      cols = Math.max(
        1,
        Math.min(
          multiMonthMaxColumns,
          Math.floor(innerWidth / singleMonthMinWidth),
        ),
      )

      if (props.forPrint) {
        cols = Math.min(cols, 2)
      }

      cssMonthWidth = fracToCssDim(1 / cols)
      hasLateralSiblings = cols > 1
    }

    return (
      <NowTimer unit="day">
        {(nowDate: DateMarker, todayRange: DateRange) => (
          <ViewContainer
            viewSpec={context.viewSpec}
            className={joinClassNames(
              // HACK for Safari. Can't do break-inside:avoid with flexbox items, likely b/c it's not standard:
              // https://stackoverflow.com/a/60256345
              !props.forPrint && classNames.flexCol,
              props.className,
            )}
          >
            <Scroller
              vertical={verticalScrolling}
              className={verticalScrolling ? classNames.liquid : ''}
              ref={this.scrollerRef}
            >
              <div
                role='list'
                ref={this.tilesElRef}
                aria-labelledby={props.labelId}
                aria-label={props.labelStr}
                className={classNames.safeTiles}
              >
                {monthDateProfiles.map((monthDateProfile, i) => {
                  const monthStr = formatIsoMonthStr(monthDateProfile.currentRange.start)

                  return (
                    <SingleMonth
                      {...props}
                      key={monthStr}
                      todayRange={todayRange}
                      isoDateStr={monthStr}
                      titleFormat={monthTitleFormat}
                      dateProfile={monthDateProfile}
                      width={cssMonthWidth}
                      colCount={cols}
                      isFirst={!i}
                      isLast={i === monthDateProfiles.length - 1}
                      hasLateralSiblings={hasLateralSiblings}
                    />
                  )
                })}
              </div>
            </Scroller>
            <Ruler widthRef={this.handleInnerWidth} />
          </ViewContainer>
        )}
      </NowTimer>
    )
  }

  // Lifecycle
  // -----------------------------------------------------------------------------------------------

  componentDidMount(): void {
    this._isUnmounting = false
    this.scrollState.date = this.props.dateProfile.currentDate
    this.scrollerRef.current.addScrollStartListener(this.handleScrollStart)
    this.scrollerRef.current.addScrollEndListener(this.handleScrollEnd)
    // this.applyScroll() // definitely not ready yet b/c doesn't have state.innerWidth

    // workaround for off-by-a-few-pixels on first time when multiMonthMaxColumns=1, not sure why
    setTimeout(() => {
      this.applyScroll()
    }, 0)
  }

  componentDidUpdate(prevProps: ViewProps, prevState: MultiMonthViewState) {
    if (prevProps.dateProfile !== this.props.dateProfile) {
      if (this.context.options.scrollTimeReset) {
        this.resetScroll()
      } else {
        this.applyScroll()
      }
    } else if (prevState.innerWidth !== this.state.innerWidth) {
      this.applyScroll()
    }
  }

  componentWillUnmount() {
    this._isUnmounting = true
    this.scrollerRef.current.removeScrollStartListener(this.handleScrollStart)
    this.scrollerRef.current.removeScrollEndListener(this.handleScrollEnd)
  }

  // Scrolling
  // -----------------------------------------------------------------------------------------------

  private handleInnerWidth = (innerWidth: number) => {
    if (this._isUnmounting) return
    this.setState({ innerWidth })
  }

  private resetScroll() {
    this.scrollState.date = this.props.dateProfile.currentDate
    this.scrollState.top = undefined
    this.applyScroll()
  }

  private applyScroll() {
    const scroller = this.scrollerRef.current
    const top = this.computeScrollTop()

    if (scroller && top != null) {
      scroller.scrollTo({ y: top })
    }
  }

  private handleScrollStart = () => {
    this.scrollState.date = undefined
    this.scrollState.top = undefined
  }

  private handleScrollEnd = (isDevice: boolean) => {
    const scroller = this.scrollerRef.current

    if (isDevice && scroller) {
      this.scrollState.top = scroller.y
      this.scrollState.date = undefined
    }
  }

  private computeScrollTop() {
    const { scrollState } = this

    if (scrollState.top != null) {
      return scrollState.top
    }

    if (scrollState.date != null) {
      const tilesEl = this.tilesElRef.current
      const monthEl = tilesEl?.querySelector<HTMLElement>(`[data-date="${formatIsoMonthStr(scrollState.date)}"]`)
      const monthWrapEl = monthEl?.parentElement as HTMLElement | null

      if (tilesEl && monthWrapEl) {
        // rounding required for proper alignment
        const monthTop = Math.round(monthWrapEl.getBoundingClientRect().top)
        const originTop = Math.round(tilesEl.getBoundingClientRect().top)
        return monthTop - originTop
      }
    }
  }
}

// date profile
// -------------------------------------------------------------------------------------------------

const oneMonthDuration = createDuration(1, 'month')

function splitDateProfileByMonth(
  dateProfileGenerator: DateProfileGenerator,
  dateProfile: DateProfile,
  dateEnv: DateEnv,
  fixedWeekCount?: boolean,
  showNonCurrentDates?: boolean,
): DateProfile[] {
  const { start, end } = dateProfile.currentRange
  let monthStart: DateMarker = start
  const monthDateProfiles: DateProfile[] = []

  while (monthStart.valueOf() < end.valueOf()) {
    const monthEnd = dateEnv.add(monthStart, oneMonthDuration)
    const currentRange = {
      // yuck
      start: dateProfileGenerator.skipHiddenDays(monthStart),
      end: dateProfileGenerator.skipHiddenDays(monthEnd, -1, true),
    }
    let renderRange = buildDayTableRenderRange({
      currentRange,
      snapToWeek: true,
      fixedWeekCount,
      dateEnv,
    })
    renderRange = {
      // yuck
      start: dateProfileGenerator.skipHiddenDays(renderRange.start),
      end: dateProfileGenerator.skipHiddenDays(renderRange.end, -1, true),
    }
    const activeRange = dateProfile.activeRange ?
      intersectRanges(
        dateProfile.activeRange,
        showNonCurrentDates ? renderRange : currentRange,
      ) :
      null

    monthDateProfiles.push({
      currentDate: dateProfile.currentDate,
      isValid: dateProfile.isValid,
      validRange: dateProfile.validRange,
      renderRange,
      activeRange,
      currentRange,
      currentRangeUnit: 'month',
      isRangeAllDay: true,
      dateIncrement: dateProfile.dateIncrement,
      slotMinTime: dateProfile.slotMaxTime,
      slotMaxTime: dateProfile.slotMinTime,
    })

    monthStart = monthEnd
  }

  return monthDateProfiles
}

// date formatting
// -------------------------------------------------------------------------------------------------

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
