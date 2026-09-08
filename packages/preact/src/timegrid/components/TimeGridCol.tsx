import { DayLaneInfo } from '../../common/DayLaneContainer'
import { joinClassNames } from '../../util/html'
import { BaseComponent } from '../../vdom-util'
import { BgEvent, renderFill } from '../../common/bg-fill'
import { buildEventRangeKey, EventRangeProps, getEventRangeMeta, sortEventSegs } from '../../component-util/event-rendering'
import { ContentContainer, generateClassName } from '../../content-inject/ContentContainer'
import { DateMarker, DateRange, formatDayString } from '@full-ui/headless-calendar'
import { DateProfile } from '../../DateProfileGenerator'
import { Dictionary } from '../../options'
import { EventSegUiInteractionState } from '../../component/DateComponent'
import { fracToCssDim } from '../../util/html'
import { getDateMeta } from '../../component-util/date-rendering'
import { memoize } from '../../util/memoize'
import classNames from '../../styles.module.css'
import { TimeGridRange } from '../TimeColsSeg'
import {
  buildTimeGridSegPlacements,
  computeFgSegVerticals,
  type TimeGridSegHiddenGroup,
  type TimeGridSegPlacement,
  type TimeGridSegVertical,
} from '../seg-placement-adapter'
import { ESTIMATED_SLAT_HEIGHT } from '../slat-estimate'
import { computeTimeGridPrintMode } from '../print-mode'
import { TimeGridEvent } from './TimeGridEvent'
import { TimeGridMoreLink } from './TimeGridMoreLink'
import { TimeGridNowIndicatorLine } from './TimeGridNowIndicatorLine'

export interface TimeGridColProps {
  dateProfile: DateProfile
  nowDate: DateMarker
  nowMs?: number
  todayRange: DateRange
  date: DateMarker
  isMajor: boolean
  slatCnt: number
  attrs?: any
  renderProps?: any
  dateSpanProps?: Dictionary
  forPrint: boolean
  borderStart: boolean
  isNarrow: boolean
  isMicro: boolean

  // content
  fgEventSegs: (TimeGridRange & EventRangeProps)[]
  bgEventSegs: (TimeGridRange & EventRangeProps)[]
  businessHourSegs: (TimeGridRange & EventRangeProps)[]
  nowIndicatorSegs: TimeGridRange[]
  dateSelectionSegs: (TimeGridRange & EventRangeProps)[]
  eventDrag: EventSegUiInteractionState<TimeGridRange> | null
  eventResize: EventSegUiInteractionState<TimeGridRange> | null
  eventSelection: string

  // dimensions
  width: number | undefined
  slatHeight: number | undefined
}

export class TimeGridCol extends BaseComponent<TimeGridColProps> {
  private sortEventSegs: typeof sortEventSegs = memoize(sortEventSegs)
  private getDateMeta = memoize(getDateMeta)

  render() {
    let { props, context } = this
    let { options, dateEnv } = context
    let isSelectMirror = options.selectMirror

    let mirrorSegs: (TimeGridRange & EventRangeProps)[] = // yuck
      (props.eventDrag && props.eventDrag.segs) ||
      (props.eventResize && props.eventResize.segs) ||
      (isSelectMirror && props.dateSelectionSegs) ||
      []

    let dateMeta = this.getDateMeta(props.date, dateEnv, props.dateProfile, props.todayRange)

    const baseClassName = joinClassNames(
      classNames.borderlessY,
      classNames.borderlessEnd,
      !props.borderStart && classNames.borderlessStart,
      props.width == null && classNames.liquid,
      classNames.rel, // origin for abs-positioned children within
      classNames.z1, // get above slots
    )

    const baseStyle = {
      width: props.width,
    }

    const isStack = this.getIsStack()
    const renderProps: DayLaneInfo = {
      ...dateMeta,
      ...props.renderProps,
      isStack,
      isNarrow: props.isNarrow,
      isMajor: props.isMajor,
      view: context.viewApi,
    }

    if (dateMeta.isDisabled) {
      return (
        <div
          role='gridcell'
          aria-disabled
          className={joinClassNames(
            generateClassName(options.dayLaneClass, renderProps),
            baseClassName,
          )}
          style={baseStyle}
        />
      )
    }

    const innerClassName = joinClassNames(
      generateClassName(options.dayLaneInnerClass, renderProps),
      !isStack && classNames.fill,
      classNames.z1, // scope event z-indexes
    )

    const sortedFgSegs = this.sortEventSegs(props.fgEventSegs, options.eventOrder)

    return (
      <ContentContainer
        tag="div"
        attrs={{
          ...props.attrs,
          role: 'gridcell',
          ...(dateMeta.isToday ? { 'aria-current': 'date' } : {}),
          'data-date': formatDayString(props.date),
        }}
        className={baseClassName}
        style={baseStyle}
        renderProps={renderProps}
        generatorName={undefined}
        classNameGenerator={options.dayLaneClass}
        didMount={options.dayLaneDidMount}
        willUnmount={options.dayLaneWillUnmount}
      >
        {() => (
          <>
            {this.renderFillSegs(props.businessHourSegs, 'non-business')}
            {this.renderFillSegs(props.bgEventSegs, 'bg-event')}
            {this.renderFillSegs(props.dateSelectionSegs, 'highlight')}
            <div
              className={innerClassName}
            >
              {this.renderFgSegs(
                sortedFgSegs,
                /* isMirror = */ false,
              )}
            </div>
            {Boolean(mirrorSegs.length) && (
              // but only show it when there are actual mirror events, to avoid blocking clicks
              <div
                className={innerClassName}
              >
                {this.renderFgSegs(
                  mirrorSegs,
                  /* isMirror = */ true,
                )}
              </div>
            )}
            {this.renderNowIndicator(props.nowIndicatorSegs)}
          </>
        )}
      </ContentContainer>
    )
  }

  renderFgSegs(
    sortedFgSegs: (TimeGridRange & EventRangeProps)[],
    isMirror: boolean,
  ) {
    const { props } = this

    if (this.getIsStack()) {
      return renderPlainFgSegs(sortedFgSegs, props, isMirror)
    }

    if (isMirror) {
      return this.renderPositionedMirrorSegs(sortedFgSegs)
    }

    return this.renderPositionedFgSegs(sortedFgSegs)
  }

  renderPositionedFgSegs(
    segs: (TimeGridRange & EventRangeProps)[], // needs to be sorted
  ) {
    let { eventMaxStack, eventOrderStrict } = this.context.options

    let segVerticals = this.computeSegVerticals(segs)
    let { placements, hiddenGroups } = buildTimeGridSegPlacements(
      segs,
      segVerticals,
      eventOrderStrict,
      eventMaxStack,
    )

    return (
      <>
        {placements.map((placement) => this.renderPositionedSeg(
          placement.seg,
          placement.segVertical,
          this.computeSegHStyle(placement),
          placement.stackDepth,
          /* isMirror = */ false,
        ))}
        {this.renderHiddenGroups(hiddenGroups)}
      </>
    )
  }

  // Mirrors bypass normal-event admission so limits cannot hide them or create more links.
  renderPositionedMirrorSegs(segs: (TimeGridRange & EventRangeProps)[]) {
    let segVerticals = this.computeSegVerticals(segs)

    return segs.map((seg, index) => this.renderPositionedSeg(
      seg,
      segVerticals[index] || {},
      { left: 0, right: 0, zIndex: 0 }, // full column width
      /* level = */ 0,
      /* isMirror = */ true,
    ))
  }

  renderPositionedSeg(
    seg: TimeGridRange & EventRangeProps,
    segVertical: Partial<TimeGridSegVertical>,
    hStyle: { zIndex: number, [prop: string]: any },
    level: number,
    isMirror: boolean,
  ) {
    let { props } = this
    let { eventRange } = seg
    let { instanceId } = eventRange.instance // guaranteed because it's an fg event

    let isSelected = instanceId === props.eventSelection
    if (isSelected) {
      hStyle.zIndex += 1000 // HACK: relies on hardcoded z-index offset; fragile if stacking context changes
    }

    let isDragging = Boolean(props.eventDrag && props.eventDrag.affectedInstances[instanceId])
    let isResizing = Boolean(props.eventResize && props.eventResize.affectedInstances[instanceId])
    let isInvisible = !isMirror && (isDragging || isResizing)

    return (
      <div
        // we would have used classNames.fill, but multi-page spanning breaks in Firefox
        // we would have used height:100%, but multi-page spanning breaks in Safari
        className={joinClassNames(classNames.abs, classNames.flexCol)}
        key={instanceId}
        style={{
          visibility: isInvisible ? 'hidden' : undefined,
          top: segVertical.start,
          height: segVertical.size,
          ...hStyle,
        }}
      >
        <TimeGridEvent
          eventRange={eventRange}
          slicedStart={seg.startDate}
          slicedEnd={seg.endDate}
          isStart={seg.isStart}
          isEnd={seg.isEnd}
          isDragging={isDragging}
          isResizing={isResizing}
          isMirror={isMirror}
          isSelected={isSelected}
          level={level}
          isNarrow={props.isNarrow}
          isShort={segVertical.isShort || false}
          isLiquid
          {...getEventRangeMeta(eventRange, props.todayRange, props.nowDate, props.nowMs)}
        />
      </div>
    )
  }

  /*
  A pixel floor is only meaningful against a real slat height, so it stays off
  while the height is assumed. See ESTIMATED_SLAT_HEIGHT for why, and for what
  the assumed pass does and does not guarantee.
  */
  // TODO: memoize this?
  computeSegVerticals(segs: (TimeGridRange & EventRangeProps)[]) {
    let { props, context } = this
    let isMeasured = props.slatHeight != null

    return computeFgSegVerticals(
      segs,
      props.dateProfile,
      props.date,
      props.slatCnt,
      props.slatHeight ?? ESTIMATED_SLAT_HEIGHT,
      isMeasured ? context.options.eventMinHeight : undefined,
      context.options.eventShortHeight,
    )
  }

  /*
  NOTE: a group's coordinates come from computeFgSegVerticals, so eventMinHeight
  has already been applied to the segs it was formed from
  */
  renderHiddenGroups(hiddenGroups: TimeGridSegHiddenGroup[]) {
    let { dateSpanProps, dateProfile, todayRange, nowDate, nowMs, eventSelection, eventDrag, eventResize, isNarrow, isMicro } = this.props

    return (
      <>
        {hiddenGroups.map((hiddenGroup) => {
          return (
            <TimeGridMoreLink
              key={hiddenGroup.key}
              hiddenSegs={hiddenGroup.segs}
              top={hiddenGroup.start}
              height={hiddenGroup.end - hiddenGroup.start}
              isNarrow={isNarrow}
              isMicro={isMicro}
              dateSpanProps={dateSpanProps}
              dateProfile={dateProfile}
              todayRange={todayRange}
              nowDate={nowDate}
              nowMs={nowMs}
              eventSelection={eventSelection}
              eventDrag={eventDrag}
              eventResize={eventResize}
            />
          )
        })}
      </>
    )
  }

  renderFillSegs(segs: (TimeGridRange & EventRangeProps)[], fillType: string) {
    let { props, context } = this
    let segVerticals = this.computeSegVerticals(segs)

    return (
      <>
        {segs.map((seg, index) => {
          const { eventRange } = seg
          const segVertical: Partial<TimeGridSegVertical> = segVerticals[index] || {}

          return (
            <div
              key={buildEventRangeKey(eventRange)}
              className={classNames.fillX}
              style={{
                top: segVertical.start,
                height: segVertical.size,

                // HACK to get bg fills to overlap cell-start border
                // which matches how dayGrid looks,
                // which is important because all-day background events, in TimeGrid,
                // will render on both at the same time
                marginInlineStart: -1,
              }}
            >
              {fillType === 'bg-event' ?
                <BgEvent
                  eventRange={eventRange}
                  isStart={seg.isStart}
                  isEnd={seg.isEnd}
                  isNarrow={props.isNarrow}
                  isShort={segVertical.isShort || false}
                  isVertical={true}
                  {...getEventRangeMeta(eventRange, props.todayRange, props.nowDate, props.nowMs)}
                /> :
                renderFill(fillType, context.options)}
            </div>
          )
        })}
      </>
    )
  }

  renderNowIndicator(segs: TimeGridRange[]) {
    let { props } = this

    if (props.forPrint || this.getIsStack()) {
      return
    }

    return segs.map((seg, i) => (
      <TimeGridNowIndicatorLine
        key={i}
        nowDate={seg.startDate}
        dayDate={props.date}
        dateProfile={props.dateProfile}
        totalHeight={props.slatHeight != null ? props.slatHeight * props.slatCnt : undefined}
        showDot={seg.showDot ?? true}
      />
    ))
  }

  /*
  TODO: eventually move to width, not left+right
  */
  computeSegHStyle(segRect: TimeGridSegPlacement) {
    let { options } = this.context
    let shouldOverlap = options.slotEventOverlap
    let nearCoord = segRect.levelCoord // the left side if LTR. the right side if RTL. floating-point
    let farCoord = segRect.levelCoord + segRect.thickness // the right side if LTR. the left side if RTL. floating-point

    if (shouldOverlap) {
      // double the width, but don't go beyond the maximum forward coordinate (1.0)
      farCoord = Math.min(1, nearCoord + (farCoord - nearCoord) * 2)
    }

    let props = {
      zIndex: segRect.stackDepth + 1, // convert from 0-base to 1-based
      insetInlineStart: fracToCssDim(nearCoord),
      insetInlineEnd: fracToCssDim(1 - farCoord),
      marginInlineEnd: undefined,
    }

    if (shouldOverlap && segRect.stackForward) {
      // add padding to the edge so that forward stacked events don't cover the resizer's icon
      props.marginInlineEnd = 10 * 2 // 10 is a guesstimate of the icon's width
    }

    return props
  }

  getIsStack() {
    const { eventPrintLayout } = this.context.options
    return computeTimeGridPrintMode(this.props.forPrint, eventPrintLayout) === 'stack'
  }
}

export function renderPlainFgSegs(
  sortedFgSegs: (TimeGridRange & EventRangeProps)[],
  { todayRange, nowDate, nowMs, eventSelection, eventDrag, eventResize }: {
    todayRange: DateRange
    nowDate: DateMarker
    nowMs?: number
    eventSelection: string
    eventDrag: EventSegUiInteractionState<TimeGridRange> | null
    eventResize: EventSegUiInteractionState<TimeGridRange> | null
  },
  isMirror: boolean,
) {
  return (
    <>
      {sortedFgSegs.map((seg) => {
        let { eventRange } = seg
        let { instanceId } = eventRange.instance
        let isDragging = Boolean(eventDrag && eventDrag.affectedInstances[instanceId])
        let isResizing = Boolean(eventResize && eventResize.affectedInstances[instanceId])
        let isInvisible = isDragging || isResizing

        return (
          <div
            key={instanceId}
            className={classNames.breakInsideAvoid}
            style={{ visibility: isInvisible ? 'hidden' : undefined }}
          >
            <TimeGridEvent
              eventRange={eventRange}
              slicedStart={seg.startDate}
              slicedEnd={seg.endDate}
              isStart={seg.isStart}
              isEnd={seg.isEnd}
              isDragging={isDragging}
              isResizing={isResizing}
              isMirror={isMirror}
              isSelected={instanceId === eventSelection}
              level={0}
              isShort={false}
              isNarrow={false}
              disableResizing
              {...getEventRangeMeta(eventRange, todayRange, nowDate, nowMs)}
            />
          </div>
        )
      })}
    </>
  )
}
