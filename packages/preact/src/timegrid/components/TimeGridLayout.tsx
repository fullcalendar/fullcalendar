import { Duration, DateMarker, DateRange } from '@full-ui/headless-calendar'
import { ViewOptions } from '../../options'
import { BaseComponent } from '../../vdom-util'
import { DateProfile } from '../../DateProfileGenerator'
import { DayTableCell } from '../../common/DayTableModel'
import { EventRangeProps } from '../../component-util/event-rendering'
import { EventSegUiInteractionState } from '../../component/DateComponent'
import { Hit } from '../../interactions/hit'
import { Scroller } from '../../scrollgrid/Scroller'
import { SlicedCoordRange } from '../../coord-range'
import { ViewContainer } from '../../common/ViewContainer'
import { afterSize } from '../../component-util/resize-observer'
import { memoize } from '../../util/memoize'
import { joinClassNames } from '../../util/html'
import { generateClassName } from '../../content-inject/ContentContainer'
import { createRef } from 'react'
import classNames from '../../styles.module.css'
import { buildSlatMetas } from '../time-slat-meta'
import { TimeGridRange } from '../TimeColsSeg'
import { TimeGridLayoutPannable } from './TimeGridLayoutPannable'
import { TimeGridLayoutNormal } from './TimeGridLayoutNormal'
import { computeTimeTopFrac } from './util'
import { RowConfig } from '../../daygrid/header-tier'
import { computeViewBorderless } from '../../util/misc'

export interface TimeGridLayoutProps {
  labelId: string | undefined
  labelStr: string | undefined

  dateProfile: DateProfile
  nowDate: DateMarker
  todayRange: DateRange
  cells: DayTableCell[]
  forPrint: boolean
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean
  className: string

  // header content
  headerTiers: RowConfig<any, { text: string, isDisabled: boolean }>[]

  // all-day content
  fgEventSegs: (SlicedCoordRange & EventRangeProps)[],
  bgEventSegs: (SlicedCoordRange & EventRangeProps)[],
  businessHourSegs: (SlicedCoordRange & EventRangeProps)[],
  dateSelectionSegs: (SlicedCoordRange & EventRangeProps)[],
  eventDrag: EventSegUiInteractionState<SlicedCoordRange> | null,
  eventResize: EventSegUiInteractionState<SlicedCoordRange> | null,

  // timed content
  fgEventSegsByCol: (TimeGridRange & EventRangeProps)[][]
  bgEventSegsByCol: (TimeGridRange & EventRangeProps)[][]
  businessHourSegsByCol: (TimeGridRange & EventRangeProps)[][]
  nowIndicatorSegsByCol: TimeGridRange[][]
  dateSelectionSegsByCol: (TimeGridRange & EventRangeProps)[][]
  eventDragByCol: EventSegUiInteractionState<TimeGridRange>[]
  eventResizeByCol: EventSegUiInteractionState<TimeGridRange>[]

  // universal content
  eventSelection: string
}

interface TimeScroll {
  time?: Duration
  y?: number
}

function buildEmptySegCols<T>(segsByCol: T[][]): T[][] {
  return segsByCol.map(() => [])
}

function buildEmptyInteractionCols<T>(
  interactionsByCol: EventSegUiInteractionState<T>[],
): EventSegUiInteractionState<T>[] {
  return interactionsByCol.map(() => null as any)
}

export class TimeGridLayout extends BaseComponent<TimeGridLayoutProps> {
  // memo
  private buildSlatMetas = memoize(buildSlatMetas)

  // refs
  private dayScrollerRef = createRef<Scroller>()
  private timeScrollerRef = createRef<Scroller>()
  private slatHeight?: number

  // internal
  private _isUnmounting: boolean
  private currentSlatCnt?: number
  private scrollState: TimeScroll = {} // updated in-place

  render() {
    const { props, context } = this
    const { dateProfile } = props
    const { options, dateEnv } = context
    const { dayMinWidth } = options
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options)

    const slatMetas = this.buildSlatMetas(
      dateProfile.slotMinTime,
      dateProfile.slotMaxTime,
      options.slotHeaderInterval,
      options.slotDuration,
      dateEnv,
    )
    this.currentSlatCnt = slatMetas.length
    const businessHourSegs = props.forPrint ? [] : props.businessHourSegs
    const dateSelectionSegs = props.forPrint ? [] : props.dateSelectionSegs
    const eventDrag = props.forPrint ? null : props.eventDrag
    const eventResize = props.forPrint ? null : props.eventResize
    const businessHourSegsByCol = props.forPrint ? buildEmptySegCols(props.businessHourSegsByCol) : props.businessHourSegsByCol
    const dateSelectionSegsByCol = props.forPrint ? buildEmptySegCols(props.dateSelectionSegsByCol) : props.dateSelectionSegsByCol
    const eventDragByCol = props.forPrint ? buildEmptyInteractionCols(props.eventDragByCol) : props.eventDragByCol
    const eventResizeByCol = props.forPrint ? buildEmptyInteractionCols(props.eventResizeByCol) : props.eventResizeByCol

    const commonLayoutProps = {
      dateProfile: dateProfile,
      nowDate: props.nowDate,
      todayRange: props.todayRange,
      cells: props.cells,
      slatMetas,
      forPrint: props.forPrint,
      isHitComboAllowed: props.isHitComboAllowed,

      // header content
      headerTiers: props.headerTiers,

      // all-day content
      fgEventSegs: props.fgEventSegs,
      bgEventSegs: props.bgEventSegs,
      businessHourSegs,
      dateSelectionSegs,
      eventDrag,
      eventResize,
      ...getAllDayMaxEventProps(options),

      // timed content
      fgEventSegsByCol: props.fgEventSegsByCol,
      bgEventSegsByCol: props.bgEventSegsByCol,
      businessHourSegsByCol,
      nowIndicatorSegsByCol: props.nowIndicatorSegsByCol,
      dateSelectionSegsByCol,
      eventDragByCol,
      eventResizeByCol,

      // universal content
      eventSelection: props.eventSelection,

      // refs
      timeScrollerRef: this.timeScrollerRef,
      timeScrollState: this.scrollState,
      slatHeightRef: this.handleSlatHeight,

      borderlessX,
      borderlessBottom,
    }

    return (
      <ViewContainer
        attrs={{
          role: 'grid',
          'aria-colcount': props.cells.length,
          'aria-labelledby': props.labelId,
          'aria-label': props.labelStr,
        }}
        className={joinClassNames(
          props.className,
          generateClassName(options.tableClass, {
            borderlessX,
            borderlessTop,
            borderlessBottom,
            multiMonthColumns: 0,
          }),
          // we don't do classNames.printRoot/classNames.printHeader here because works poorly with print:
          // - Firefox >85ish CAN have flexboxes within it, but those cannot do absolute positioning
          // - Chrome works okay, but abs-positioned events cover the repeated header
          //   Also, there's weird padding on the last page at bottom of container, which matches
          //   the height of the repeated header
          // - Safari was never able to do repeated headers in the first place
          !props.forPrint && classNames.flexCol,
          classNames.isolate, // for inner z-index of layout. somehow move to layouts?
        )}
        viewSpec={context.viewSpec}
      >
        {dayMinWidth ? (
          <TimeGridLayoutPannable
            {...commonLayoutProps}
            dayMinWidth={dayMinWidth}
            dayScrollerRef={this.dayScrollerRef}
          />
        ) : (
          <TimeGridLayoutNormal {...commonLayoutProps} />
        )}
      </ViewContainer>
    )
  }

  // Lifecycle
  // -----------------------------------------------------------------------------------------------

  componentDidMount() {
    this._isUnmounting = false
    this.resetScroll()
    this.context.emitter.on('_timeScrollRequest', this.handleTimeScrollRequest)

    const timeScroller = this.timeScrollerRef.current
    if (timeScroller) {
      timeScroller.addScrollEndListener(this.handleTimeScrollEnd)
    }
  }

  componentDidUpdate(prevProps: TimeGridLayoutProps) {
    if (prevProps.dateProfile !== this.props.dateProfile && this.context.options.scrollTimeReset) {
      this.resetScroll()
    } else if (prevProps.forPrint && !this.props.forPrint) {
      // returning from print
      // reapply scrolling because scroll-divs were probably restored
      this.applyTimeScroll()
    }
  }

  componentWillUnmount() {
    this._isUnmounting = true
    this.context.emitter.off('_timeScrollRequest', this.handleTimeScrollRequest)

    const timeScroller = this.timeScrollerRef.current
    if (timeScroller) {
      timeScroller.removeScrollEndListener(this.handleTimeScrollEnd)
    }
  }

  // Sizing
  // -----------------------------------------------------------------------------------------------

  private handleSlatHeight = (slatHeight: number | null) => {
    if (this._isUnmounting) return
    this.slatHeight = slatHeight

    if (slatHeight != null) {
      afterSize(this.applyTimeScroll)
    }
  }

  // Scrolling
  // -----------------------------------------------------------------------------------------------

  private resetScroll() {
    this.handleTimeScrollRequest(this.context.options.scrollTime)

    // also resets day scroll
    const dayScroller = this.dayScrollerRef.current
    if (dayScroller) {
      dayScroller.scrollTo({ x: 0 })
    }
  }

  private handleTimeScrollRequest = (scrollTime: Duration) => {
    this.scrollState.time = scrollTime
    this.scrollState.y = undefined
    this.applyTimeScroll()
  }

  /*
  Captures current values
  */
  private handleTimeScrollEnd = (isDevice: boolean) => {
    if (isDevice) {
      const y = this.timeScrollerRef.current.y

      // record, but only if not forPrint, which could give bogus values in the case of
      // TimeGridLayoutPannable, which kills y-scrolling, but retains x-scrolling,
      // which reports as a 0 y-scroll.
      if (!this.props.forPrint) {
        this.scrollState.y = y
        this.scrollState.time = undefined
      }
    }
  }

  private applyTimeScroll = () => {
    const timeScroller = this.timeScrollerRef.current
    const { slatHeight, scrollState } = this
    let { y, time } = scrollState

    if (
      y == null &&
      time &&
      slatHeight != null &&
      // Since applyTimeScroll is called by handleSlatHeight, could be called with null during cleanup,
      // and the timeScroller might not exist
      timeScroller
    ) {
      y = computeTimeTopFrac(time, this.props.dateProfile)
        * (slatHeight * this.currentSlatCnt)

      if (y) {
        y++ // overcome top border
      }

      scrollState.y = y // HACK: store raw pixel value
    }

    if (y != null) {
      timeScroller.scrollTo({ y })
    }
  }
}

// Utils
// -----------------------------------------------------------------------------------------------

const AUTO_ALL_DAY_MAX_EVENT_ROWS = 5

function getAllDayMaxEventProps(options: ViewOptions) {
  let { dayMaxEvents, dayMaxEventRows } = options

  if (dayMaxEvents === true || dayMaxEventRows === true) { // is auto?
    dayMaxEvents = undefined
    dayMaxEventRows = AUTO_ALL_DAY_MAX_EVENT_ROWS // make sure "auto" goes to a real number
  }

  return { dayMaxEvents, dayMaxEventRows }
}
