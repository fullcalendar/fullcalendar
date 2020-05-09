import { Ref, DateMarker, BaseComponent, h, EventSegUiInteractionState, Seg, getSegMeta, DateRange, Fragment, DayCellRoot, NowIndicatorRoot, DayCellContent, BgEvent, renderFill, DateProfile } from '@fullcalendar/common'
import { TimeColsSeg } from './TimeColsSeg'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords'
import { computeSegCoords, computeSegVerticals } from './event-placement'
import { TimeColEvent } from './TimeColEvent'


export interface TimeColProps {
  elRef?: Ref<HTMLTableCellElement>
  dateProfile: DateProfile
  date: DateMarker
  nowDate: DateMarker
  todayRange: DateRange
  extraDataAttrs?: any
  extraHookProps?: any
  extraClassNames?: string[]
  fgEventSegs: TimeColsSeg[]
  bgEventSegs: TimeColsSeg[]
  businessHourSegs: TimeColsSeg[]
  nowIndicatorSegs: TimeColsSeg[]
  dateSelectionSegs: TimeColsSeg[]
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  slatCoords: TimeColsSlatsCoords
}

export class TimeCol extends BaseComponent<TimeColProps> {


  render() {
    let { props, context } = this
    let isSelectMirror = context.options.selectMirror

    let mirrorSegs: Seg[] = // yuck
      (props.eventDrag && props.eventDrag.segs) ||
      (props.eventResize && props.eventResize.segs) ||
      (isSelectMirror && props.dateSelectionSegs) ||
      []

    let interactionAffectedInstances = // TODO: messy way to compute this
      (props.eventDrag && props.eventDrag.affectedInstances) ||
      (props.eventResize && props.eventResize.affectedInstances) ||
      {}

    return (
      <DayCellRoot elRef={props.elRef} date={props.date} dateProfile={props.dateProfile} todayRange={props.todayRange} extraHookProps={props.extraHookProps}>
        {(rootElRef, classNames, dataAttrs) => (
          <td
            ref={rootElRef}
            className={[ 'fc-timegrid-col' ].concat(classNames, props.extraClassNames || []).join(' ')}
            {...dataAttrs}
            {...props.extraDataAttrs}
          >
            <div className='fc-timegrid-col-origin'>
              <div className='fc-timegrid-col-events'>
                {/* the Fragments scope the keys */}
                <Fragment>
                  {this.renderFgSegs(
                    mirrorSegs as TimeColsSeg[],
                    {},
                    Boolean(props.eventDrag),
                    Boolean(props.eventResize),
                    Boolean(isSelectMirror)
                    // TODO: pass in left/right instead of using only computeSegTopBottomCss
                  )}
                </Fragment>
                <Fragment>
                  {this.renderFgSegs(
                    props.fgEventSegs,
                    interactionAffectedInstances
                  )}
                </Fragment>
              </div>
              <div className='fc-timegrid-col-bg'>
                <Fragment>{this.renderFillSegs(props.businessHourSegs, 'non-business')}</Fragment>
                <Fragment>{this.renderFillSegs(props.bgEventSegs, 'bg-event')}</Fragment>
                <Fragment>{this.renderFillSegs(props.dateSelectionSegs, 'highlight')}</Fragment>
              </div>
              {this.renderNowIndicator(props.nowIndicatorSegs)}
            </div>
            <TimeColMisc
              date={props.date}
              dateProfile={props.dateProfile}
              todayRange={props.todayRange}
              extraHookProps={props.extraHookProps}
            />
          </td>
        )}
      </DayCellRoot>
    )
  }


  renderFgSegs(
    segs: TimeColsSeg[],
    segIsInvisible: { [instanceId: string]: any },
    isDragging?: boolean,
    isResizing?: boolean,
    isDateSelecting?: boolean
  ) {
    let { context, props } = this

    if (!props.slatCoords) { return }

    // assigns TO THE SEGS THEMSELVES
    // also, receives resorted array
    segs = computeSegCoords(segs, props.date, props.slatCoords, context.options.eventMinHeight, context.options.eventOrderSpecs) as TimeColsSeg[]

    return segs.map((seg) => {
      let instanceId = seg.eventRange.instance.instanceId
      let isMirror = isDragging || isResizing || isDateSelecting
      let positionCss = isMirror ?
        // will span entire column width
        // also, won't assign z-index, which is good, fc-event-mirror will overpower other harnesses
        { left: 0, right: 0, ...this.computeSegTopBottomCss(seg) }
        :
        this.computeFgSegPositionCss(seg)

      return (
        <div
          className={'fc-timegrid-event-harness' + (seg.level > 0 ? ' fc-timegrid-event-harness-inset' : '')}
          key={instanceId}
          style={{
            visibility: segIsInvisible[instanceId] ? 'hidden' : ('' as any),
            ...positionCss
          }}
        >
          <TimeColEvent
            seg={seg}
            isDragging={isDragging}
            isResizing={isResizing}
            isDateSelecting={isDateSelecting}
            isSelected={instanceId === props.eventSelection}
            {...getSegMeta(seg, props.todayRange, props.nowDate)}
          />
        </div>
      )
    })
  }


  renderFillSegs(segs: TimeColsSeg[], fillType: string) {
    let { context, props } = this

    if (!props.slatCoords) { return }

    // BAD: assigns TO THE SEGS THEMSELVES
    computeSegVerticals(segs, props.date, props.slatCoords, context.options.eventMinHeight)

    return segs.map((seg) => {

      // inverse-background events don't have specific instances
      // TODO: might be a key collision. better solution
      let { eventRange } = seg
      let key = eventRange.instance ? eventRange.instance.instanceId : eventRange.def.defId

      return (
        <div className='fc-timegrid-bg-harness' style={this.computeSegTopBottomCss(seg)}>
          {fillType === 'bg-event' ?
            <BgEvent
              key={key}
              seg={seg}
              {...getSegMeta(seg, props.todayRange, props.nowDate)}
            /> :
            renderFill(fillType)
          }
        </div>
      )
    })
  }


  renderNowIndicator(segs: TimeColsSeg[]) {
    let { slatCoords, date } = this.props

    if (!slatCoords) { return }

    return segs.map((seg) => (
      <NowIndicatorRoot isAxis={false} date={date}>
        {(rootElRef, classNames, innerElRef, innerContent) => (
          <div
            ref={rootElRef}
            className={[ 'fc-timegrid-now-indicator-line' ].concat(classNames).join(' ')}
            style={{ top: slatCoords.computeDateTop(seg.start, date) }}
          >{innerContent}</div>
        )}
      </NowIndicatorRoot>
    ))
  }


  computeFgSegPositionCss(seg) {
    let { isRtl, options } = this.context
    let shouldOverlap = options.slotEventOverlap
    let backwardCoord = seg.backwardCoord // the left side if LTR. the right side if RTL. floating-point
    let forwardCoord = seg.forwardCoord // the right side if LTR. the left side if RTL. floating-point
    let left // amount of space from left edge, a fraction of the total width
    let right // amount of space from right edge, a fraction of the total width

    if (shouldOverlap) {
      // double the width, but don't go beyond the maximum forward coordinate (1.0)
      forwardCoord = Math.min(1, backwardCoord + (forwardCoord - backwardCoord) * 2)
    }

    if (isRtl) {
      left = 1 - forwardCoord
      right = backwardCoord
    } else {
      left = backwardCoord
      right = 1 - forwardCoord
    }

    let props = {
      zIndex: seg.level + 1, // convert from 0-base to 1-based
      left: left * 100 + '%',
      right: right * 100 + '%'
    }

    if (shouldOverlap && seg.forwardPressure) {
      // add padding to the edge so that forward stacked events don't cover the resizer's icon
      props[isRtl ? 'marginLeft' : 'marginRight'] = 10 * 2 // 10 is a guesstimate of the icon's width
    }

    return { ...props, ...this.computeSegTopBottomCss(seg) }
  }


  computeSegTopBottomCss(seg) {
    return {
      top: seg.top,
      bottom: -seg.bottom
    }
  }

}


interface TimeColMiscProps { // should be given nowDate too??
  dateProfile: DateProfile
  date: DateMarker
  todayRange: DateRange
  extraHookProps?: any
}

class TimeColMisc extends BaseComponent<TimeColMiscProps> {

  render() {
    let { props } = this

    return (
      <DayCellContent date={props.date} dateProfile={props.dateProfile} todayRange={props.todayRange} extraHookProps={props.extraHookProps}>
        {(innerElRef, innerContent) => (
          innerContent &&
            <div className='fc-timegrid-col-misc' ref={innerElRef}>{innerContent}</div>
        )}
      </DayCellContent>
    )
  }
}
