import { Ref, DateMarker, BaseComponent, ComponentContext, h, EventSegUiInteractionState, Seg, getDayClassNames, getSegMeta, DateRange, getDayMeta, DateProfile, Fragment, MountHook, setRef, ClassNamesHook, InnerContentHook, formatDayString } from '@fullcalendar/core'
import TimeColsSeg from './TimeColsSeg'
import TimeColsSlatsCoords from './TimeColsSlatsCoords'
import { computeSegCoords, computeSegVerticals } from './event-placement'
import TimeColEvent from './TimeColEvent'


export interface TimeColProps {
  elRef?: Ref<HTMLTableCellElement>
  date: DateMarker
  dateProfile: DateProfile
  nowDate: DateMarker
  todayRange: DateRange
  htmlAttrs: any
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

export default class TimeCol extends BaseComponent<TimeColProps> {


  render(props: TimeColProps, state: {}, context: ComponentContext) {
    let { options } = context
    let dateStr = formatDayString(props.date)
    let dayMeta = getDayMeta(props.date, props.todayRange, props.dateProfile)
    let staticProps = {
      date: props.date,
      view: context.view
    }
    let dynamicProps = {
      ...staticProps,
      ...dayMeta
    }
    let standardClassNames = [ 'fc-timegrid-col' ].concat(
      getDayClassNames(dayMeta, context.theme)
    )

    let mirrorSegs: Seg[] = // yuck
      (props.eventDrag && props.eventDrag.segs.length ? props.eventDrag.segs : null) ||
      (props.eventResize && props.eventResize.segs.length ? props.eventResize.segs : null) ||
      (options.selectMirror ? props.dateSelectionSegs : null) ||
      []

    let interactionAffectedInstances = // TODO: messy way to compute this
      (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
      (props.eventResize ? props.eventResize.affectedInstances : null) ||
      {}

    return (
      <MountHook
        name='dateCell'
        handlerProps={staticProps}
        content={(rootElRef: Ref<HTMLTableCellElement>) => (
          <ClassNamesHook
            name='dateCell'
            handlerProps={dynamicProps}
            content={(customClassNames) => (
              <td
                className={standardClassNames.concat(customClassNames).join(' ')}
                ref={(el: HTMLElement | null) => {
                  setRef(props.elRef, el)
                  setRef(rootElRef, el)
                }}
                data-date={dateStr}
                {...props.htmlAttrs}
              >
                <div class='fc-timegrid-col-inner'>
                  <div class='fc-timegrid-col-events'>
                    {/* the Fragments scope the keys */}
                    <Fragment>
                      {this.renderFgSegs(
                        mirrorSegs as TimeColsSeg[],
                        {},
                        Boolean(props.eventDrag && props.eventDrag.segs.length), // messy check!
                        Boolean(props.eventResize && props.eventResize.segs.length), // messy check!
                        Boolean(options.selectMirror && props.dateSelectionSegs.length) // messy check!
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
                  {this.renderNowIndicator(props.nowIndicatorSegs)}
                  <Fragment>{this.renderFillSegs(props.businessHourSegs, interactionAffectedInstances, 'fc-nonbusiness')}</Fragment>
                  <Fragment>{this.renderFillSegs(props.bgEventSegs, interactionAffectedInstances, 'fc-bgevent')}</Fragment>
                  <Fragment>{this.renderFillSegs(props.dateSelectionSegs, interactionAffectedInstances, 'fc-highlight')}</Fragment>
                </div>
                <InnerContentHook
                  name='dateCell'
                  innerProps={dynamicProps}
                  outerContent={(innerContentParentRef, innerContent, anySpecified) => (
                    anySpecified && (
                      <div class='fc-timegrid-col-misc' ref={innerContentParentRef}>{innerContent}</div>
                    )
                  )}
                />
              </td>
            )}
          />
        )}
      />
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
    computeSegCoords(segs, props.date, props.slatCoords, context.options.eventMinHeight, context.eventOrderSpecs)

    return segs.map((seg) => {
      let instanceId = seg.eventRange.instance.instanceId
      let isMirror = isDragging || isResizing || isDateSelecting
      let positionCss = isMirror
        ? { left: 0, right: 0, ...this.computeSegTopBottomCss(seg) } // TODO: use real fg-segs' left/right
        : this.computeFgSegPositionCss(seg)

      return (
        <div
          class={'fc-timegrid-event-harness' + (seg.level > 0 ? ' fc-timegrid-event-harness-inset' : '')}
          key={instanceId}
          style={{
            visibility: segIsInvisible[instanceId] ? 'hidden' : '',
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


  renderFillSegs(segs: TimeColsSeg[], segIsNoDisplay: { [instanceId: string]: any }, className: string) {
    let { context, props } = this

    if (!props.slatCoords) { return }

    // BAD: assigns TO THE SEGS THEMSELVES
    computeSegVerticals(segs, props.date, props.slatCoords, context.options.eventMinHeight)

    return segs.map((seg) => (
      <div class={className} style={this.computeSegTopBottomCss(seg)}></div>
    ))
  }


  renderNowIndicator(segs: TimeColsSeg[]) {
    let { slatCoords, date } = this.props

    if (!slatCoords) { return }

    return segs.map((seg) => (
      <div class='fc-now-indicator fc-now-indicator-line' style={{
        top: slatCoords.computeDateTop(seg.start, date)
      }} />
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
