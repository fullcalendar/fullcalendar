import { CssDimValue } from '@fullcalendar/core'
import {
  DateMarker, BaseComponent, EventSegUiInteractionState, Seg, getSegMeta,
  DateRange, DayCellContainer, NowIndicatorContainer, BgEvent, renderFill, buildIsoString, computeEarliestSegStart,
  DateProfile, buildEventRangeKey, sortEventSegs, memoize, SegEntryGroup, SegEntry, Dictionary, SegSpan, hasCustomDayCellContent,
} from '@fullcalendar/core/internal'
import {
  createElement,
  Fragment,
  Ref,
} from '@fullcalendar/core/preact'
import { TimeColMoreLink } from './TimeColMoreLink.js'
import { TimeColsSeg } from './TimeColsSeg.js'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords.js'
import { SegWebRect } from './seg-web.js'
import { computeFgSegPlacements, computeSegVCoords } from './event-placement.js'
import { TimeColEvent } from './TimeColEvent.js'

export interface TimeColProps {
  elRef?: Ref<HTMLTableCellElement>
  dateProfile: DateProfile
  date: DateMarker
  nowDate: DateMarker
  todayRange: DateRange
  extraDataAttrs?: any
  extraRenderProps?: any
  extraClassNames?: string[]
  extraDateSpan?: Dictionary
  fgEventSegs: TimeColsSeg[]
  bgEventSegs: TimeColsSeg[]
  businessHourSegs: TimeColsSeg[]
  nowIndicatorSegs: TimeColsSeg[]
  dateSelectionSegs: TimeColsSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  slatCoords: TimeColsSlatsCoords
  forPrint: boolean
}

export class TimeCol extends BaseComponent<TimeColProps> {
  sortEventSegs = memoize(sortEventSegs) as (typeof sortEventSegs)
  // TODO: memoize event-placement?

  render() {
    let { props, context } = this
    let { options } = context
    let isSelectMirror = options.selectMirror

    let mirrorSegs: Seg[] = // yuck
      (props.eventDrag && props.eventDrag.segs) ||
      (props.eventResize && props.eventResize.segs) ||
      (isSelectMirror && props.dateSelectionSegs) ||
      []

    let interactionAffectedInstances = // TODO: messy way to compute this
      (props.eventDrag && props.eventDrag.affectedInstances) ||
      (props.eventResize && props.eventResize.affectedInstances) ||
      {}

    let sortedFgSegs = this.sortEventSegs(props.fgEventSegs, options.eventOrder) as TimeColsSeg[]

    return (
      <DayCellContainer
        elTag="td"
        elRef={props.elRef}
        elClasses={[
          'fc-timegrid-col',
          ...(props.extraClassNames || []),
        ]}
        elAttrs={{
          role: 'gridcell',
          ...props.extraDataAttrs,
        }}
        date={props.date}
        dateProfile={props.dateProfile}
        todayRange={props.todayRange}
        extraRenderProps={props.extraRenderProps}
      >
        {(InnerContent) => (
          <div className="fc-timegrid-col-frame">
            <div className="fc-timegrid-col-bg">
              {this.renderFillSegs(props.businessHourSegs, 'non-business')}
              {this.renderFillSegs(props.bgEventSegs, 'bg-event')}
              {this.renderFillSegs(props.dateSelectionSegs, 'highlight')}
            </div>
            <div className="fc-timegrid-col-events">
              {this.renderFgSegs(
                sortedFgSegs,
                interactionAffectedInstances,
                false,
                false,
                false,
              )}
            </div>
            <div className="fc-timegrid-col-events">
              {this.renderFgSegs(
                mirrorSegs as TimeColsSeg[],
                {},
                Boolean(props.eventDrag),
                Boolean(props.eventResize),
                Boolean(isSelectMirror),
                'mirror',
              )}
            </div>
            <div className="fc-timegrid-now-indicator-container">
              {this.renderNowIndicator(props.nowIndicatorSegs)}
            </div>
            {hasCustomDayCellContent(options) && (
              <InnerContent
                elTag="div"
                elClasses={['fc-timegrid-col-misc']}
              />
            )}
          </div>
        )}
      </DayCellContainer>
    )
  }

  renderFgSegs(
    sortedFgSegs: TimeColsSeg[],
    segIsInvisible: { [instanceId: string]: any },
    isDragging: boolean,
    isResizing: boolean,
    isDateSelecting: boolean,
    forcedKey?: string,
  ) {
    let { props } = this
    if (props.forPrint) {
      return renderPlainFgSegs(sortedFgSegs, props)
    }
    return this.renderPositionedFgSegs(
      sortedFgSegs,
      segIsInvisible,
      isDragging,
      isResizing,
      isDateSelecting,
      forcedKey,
    )
  }

  renderPositionedFgSegs(
    segs: TimeColsSeg[], // if not mirror, needs to be sorted
    segIsInvisible: { [instanceId: string]: any },
    isDragging: boolean,
    isResizing: boolean,
    isDateSelecting: boolean,
    forcedKey?: string,
  ) {
    let { eventMaxStack, eventShortHeight, eventOrderStrict, eventMinHeight } = this.context.options
    let { date, slatCoords, eventSelection, todayRange, nowDate } = this.props
    let isMirror = isDragging || isResizing || isDateSelecting
    let segVCoords = computeSegVCoords(segs, date, slatCoords, eventMinHeight)
    let { segPlacements, hiddenGroups } = computeFgSegPlacements(segs, segVCoords, eventOrderStrict, eventMaxStack)

    return (
      <Fragment>
        {this.renderHiddenGroups(hiddenGroups, segs)}
        {segPlacements.map((segPlacement) => {
          let { seg, rect } = segPlacement
          let instanceId = seg.eventRange.instance.instanceId
          let isVisible = isMirror || Boolean(!segIsInvisible[instanceId] && rect)
          let vStyle = computeSegVStyle(rect && rect.span)
          let hStyle = (!isMirror && rect) ? this.computeSegHStyle(rect) : { left: 0, right: 0 }
          let isInset = Boolean(rect) && rect.stackForward > 0
          let isShort = Boolean(rect) && (rect.span.end - rect.span.start) < eventShortHeight // look at other places for this problem

          return (
            <div
              className={
                'fc-timegrid-event-harness' +
                (isInset ? ' fc-timegrid-event-harness-inset' : '')
              }
              key={forcedKey || instanceId}
              style={{
                visibility: isVisible ? ('' as any) : 'hidden',
                ...vStyle,
                ...hStyle,
              }}
            >
              <TimeColEvent
                seg={seg}
                isDragging={isDragging}
                isResizing={isResizing}
                isDateSelecting={isDateSelecting}
                isSelected={instanceId === eventSelection}
                isShort={isShort}
                {...getSegMeta(seg, todayRange, nowDate)}
              />
            </div>
          )
        })}
      </Fragment>
    )
  }

  // will already have eventMinHeight applied because segInputs already had it
  renderHiddenGroups(hiddenGroups: SegEntryGroup[], segs: TimeColsSeg[]) {
    let { extraDateSpan, dateProfile, todayRange, nowDate, eventSelection, eventDrag, eventResize } = this.props
    return (
      <Fragment>
        {hiddenGroups.map((hiddenGroup) => {
          let positionCss = computeSegVStyle(hiddenGroup.span)
          let hiddenSegs = compileSegsFromEntries(hiddenGroup.entries, segs)
          return (
            <TimeColMoreLink
              key={buildIsoString(computeEarliestSegStart(hiddenSegs))}
              hiddenSegs={hiddenSegs}
              top={positionCss.top}
              bottom={positionCss.bottom}
              extraDateSpan={extraDateSpan}
              dateProfile={dateProfile}
              todayRange={todayRange}
              nowDate={nowDate}
              eventSelection={eventSelection}
              eventDrag={eventDrag}
              eventResize={eventResize}
            />
          )
        })}
      </Fragment>
    )
  }

  renderFillSegs(segs: TimeColsSeg[], fillType: string) {
    let { props, context } = this
    let segVCoords = computeSegVCoords(segs, props.date, props.slatCoords, context.options.eventMinHeight) // don't assume all populated

    let children = segVCoords.map((vcoords, i) => {
      let seg = segs[i]
      return (
        <div
          key={buildEventRangeKey(seg.eventRange)}
          className="fc-timegrid-bg-harness"
          style={computeSegVStyle(vcoords)}
        >
          {fillType === 'bg-event' ?
            <BgEvent seg={seg} {...getSegMeta(seg, props.todayRange, props.nowDate)} /> :
            renderFill(fillType)}
        </div>
      )
    })

    return <Fragment>{children}</Fragment>
  }

  renderNowIndicator(segs: TimeColsSeg[]) {
    let { slatCoords, date } = this.props

    if (!slatCoords) { return null }

    return segs.map((seg, i) => (
      <NowIndicatorContainer
        // key doesn't matter. will only ever be one
        key={i} // eslint-disable-line react/no-array-index-key
        elClasses={['fc-timegrid-now-indicator-line']}
        elStyle={{
          top: slatCoords.computeDateTop(seg.start, date),
        }}
        isAxis={false}
        date={date}
      />
    ))
  }

  computeSegHStyle(segHCoords: SegWebRect) {
    let { isRtl, options } = this.context
    let shouldOverlap = options.slotEventOverlap
    let nearCoord = segHCoords.levelCoord // the left side if LTR. the right side if RTL. floating-point
    let farCoord = segHCoords.levelCoord + segHCoords.thickness // the right side if LTR. the left side if RTL. floating-point
    let left // amount of space from left edge, a fraction of the total width
    let right // amount of space from right edge, a fraction of the total width

    if (shouldOverlap) {
      // double the width, but don't go beyond the maximum forward coordinate (1.0)
      farCoord = Math.min(1, nearCoord + (farCoord - nearCoord) * 2)
    }

    if (isRtl) {
      left = 1 - farCoord
      right = nearCoord
    } else {
      left = nearCoord
      right = 1 - farCoord
    }

    let props = {
      zIndex: segHCoords.stackDepth + 1, // convert from 0-base to 1-based
      left: left * 100 + '%',
      right: right * 100 + '%',
    }

    if (shouldOverlap && !segHCoords.stackForward) {
      // add padding to the edge so that forward stacked events don't cover the resizer's icon
      props[isRtl ? 'marginLeft' : 'marginRight'] = 10 * 2 // 10 is a guesstimate of the icon's width
    }

    return props
  }
}

export function renderPlainFgSegs(
  sortedFgSegs: TimeColsSeg[],
  { todayRange, nowDate, eventSelection, eventDrag, eventResize }: {
    todayRange: DateRange
    nowDate: DateMarker
    eventSelection: string
    eventDrag: EventSegUiInteractionState | null
    eventResize: EventSegUiInteractionState | null
  },
) {
  let hiddenInstances =
    (eventDrag ? eventDrag.affectedInstances : null) ||
    (eventResize ? eventResize.affectedInstances : null) ||
    {}
  return (
    <Fragment>
      {sortedFgSegs.map((seg) => {
        let instanceId = seg.eventRange.instance.instanceId
        return (
          <div
            key={instanceId}
            style={{ visibility: hiddenInstances[instanceId] ? 'hidden' : ('' as any) }}
          >
            <TimeColEvent
              seg={seg}
              isDragging={false}
              isResizing={false}
              isDateSelecting={false}
              isSelected={instanceId === eventSelection}
              isShort={false}
              {...getSegMeta(seg, todayRange, nowDate)}
            />
          </div>
        )
      })}
    </Fragment>
  )
}

function computeSegVStyle(segVCoords: SegSpan | null): { top: CssDimValue, bottom: CssDimValue } {
  if (!segVCoords) {
    return { top: '', bottom: '' }
  }
  return {
    top: segVCoords.start,
    bottom: -segVCoords.end,
  }
}

function compileSegsFromEntries(
  segEntries: SegEntry[],
  allSegs: TimeColsSeg[],
): TimeColsSeg[] {
  return segEntries.map((segEntry) => allSegs[segEntry.index])
}
