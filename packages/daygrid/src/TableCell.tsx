import {
  Ref,
  ComponentChildren,
  createElement,
  DateMarker,
  DateComponent,
  CssDimValue,
  DateRange,
  buildNavLinkData,
  WeekNumberRoot,
  DayCellRoot,
  DateProfile,
  VUIEvent,
  setRef,
  createFormatter,
  Dictionary,
  MoreLinkRoot,
  EventApi,
  EventSegment,
} from '@fullcalendar/common'
import { TableSeg } from './TableSeg'
import { TableCellTop } from './TableCellTop'
import { TableSegPlacement } from './event-placement'

export interface TableCellProps {
  date: DateMarker
  dateProfile: DateProfile
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]
  elRef?: Ref<HTMLTableCellElement>
  innerElRef?: Ref<HTMLDivElement>
  bgContent: ComponentChildren
  fgContentElRef?: Ref<HTMLDivElement> // TODO: rename!!! classname confusion. is the "event" div
  fgContent: ComponentChildren
  fgPaddingBottom: CssDimValue
  moreCnt: number
  moreMarginTop: number
  showDayNumber: boolean
  showWeekNumber: boolean
  forceDayTop: boolean
  todayRange: DateRange
  singlePlacements: TableSegPlacement[]
}

export interface TableCellModel { // TODO: move somewhere else. combine with DayTableCell?
  key: string
  date: DateMarker
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]
}

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'narrow' })

export class TableCell extends DateComponent<TableCellProps> {
  private rootEl: HTMLElement

  render() {
    let { options } = this.context
    let { props } = this
    let { date, dateProfile } = props
    let navLinkAttrs = options.navLinks
      ? { 'data-navlink': buildNavLinkData(date, 'week'), tabIndex: 0 }
      : {}

    return (
      <DayCellRoot
        date={date}
        dateProfile={dateProfile}
        todayRange={props.todayRange}
        showDayNumber={props.showDayNumber}
        extraHookProps={props.extraHookProps}
        elRef={this.handleRootEl}
      >
        {(dayElRef, dayClassNames, rootDataAttrs, isDisabled) => (
          <td
            ref={dayElRef}
            className={['fc-daygrid-day'].concat(dayClassNames, props.extraClassNames || []).join(' ')}
            {...rootDataAttrs}
            {...props.extraDataAttrs}
          >
            <div className="fc-daygrid-day-frame fc-scrollgrid-sync-inner" ref={props.innerElRef /* different from hook system! RENAME */}>
              {props.showWeekNumber && (
                <WeekNumberRoot date={date} defaultFormat={DEFAULT_WEEK_NUM_FORMAT}>
                  {(weekElRef, weekClassNames, innerElRef, innerContent) => (
                    <a
                      ref={weekElRef}
                      className={['fc-daygrid-week-number'].concat(weekClassNames).join(' ')}
                      {...navLinkAttrs}
                    >
                      {innerContent}
                    </a>
                  )}
                </WeekNumberRoot>
              )}
              {!isDisabled && (
                <TableCellTop
                  date={date}
                  dateProfile={dateProfile}
                  showDayNumber={props.showDayNumber}
                  forceDayTop={props.forceDayTop}
                  todayRange={props.todayRange}
                  extraHookProps={props.extraHookProps}
                />
              )}
              <div
                className="fc-daygrid-day-events"
                ref={props.fgContentElRef}
                style={{ paddingBottom: props.fgPaddingBottom }}
              >
                {props.fgContent}
                {Boolean(props.moreCnt) && (
                  <div className="fc-daygrid-day-bottom" style={{ marginTop: props.moreMarginTop }}>
                    <MoreLinkRoot moreCnt={props.moreCnt}>
                      {(rootElRef, classNames, innerElRef, innerContent) => (
                        <a
                          ref={rootElRef}
                          className={['fc-daygrid-more-link'].concat(classNames).join(' ')}
                          onClick={this.handleMoreLinkClick}
                        >
                          {innerContent}
                        </a>
                      )}
                    </MoreLinkRoot>
                  </div>
                )}
              </div>
              <div className="fc-daygrid-day-bg">
                {props.bgContent}
              </div>
            </div>
          </td>
        )}
      </DayCellRoot>
    )
  }

  handleRootEl = (el: HTMLElement) => {
    this.rootEl = el
    setRef(this.props.elRef, el)
  }

  handleMoreLinkClick = (ev: VUIEvent) => {
    let { props, context } = this
    let { options, dateEnv } = context
    let { moreLinkClick } = options
    let allSegs: EventSegment[] = []
    let hiddenSegs: EventSegment[] = []

    function segForPublic(seg: TableSeg) {
      let { def, instance, range } = seg.eventRange
      return {
        event: new EventApi(context, def, instance),
        start: dateEnv.toDate(range.start),
        end: dateEnv.toDate(range.end),
        isStart: seg.isStart,
        isEnd: seg.isEnd,
      }
    }

    for (let placement of props.singlePlacements) {
      let publicSeg = segForPublic(placement.seg)
      allSegs.push(publicSeg)
      if (!placement.isVisible) {
        hiddenSegs.push(publicSeg)
      }
    }

    if (typeof moreLinkClick === 'function') {
      moreLinkClick = moreLinkClick({
        date: context.dateEnv.toDate(props.date),
        allDay: true,
        allSegs,
        hiddenSegs,
        jsEvent: ev,
        view: context.viewApi,
      }) as string | undefined
    }

    if (!moreLinkClick || moreLinkClick === 'popover') {
      console.log('TODO: open popover', allSegs, this.rootEl)
      /*
      (!props.forPrint && (
        <MorePopover
          ref={this.morePopoverRef}
          date={morePopoverState.date}
          dateProfile={dateProfile}
          segs={morePopoverState.allSegs}
          alignmentEl={morePopoverState.dayEl}
          topAlignmentEl={rowCnt === 1 ? props.headerAlignElRef.current : null}
          selectedInstanceId={props.eventSelection}
          hiddenInstances={// yuck
            (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
            (props.eventResize ? props.eventResize.affectedInstances : null) ||
            {}
          }
          todayRange={todayRange}
        />
      )

      let morePopoverHit = morePopover ? morePopover.positionToHit(leftPosition, topPosition, this.rootEl) : null
      let { morePopoverState } = this.state
      if (morePopoverHit) {
        return {
          row: morePopoverState.fromRow,
          col: morePopoverState.fromCol,
          ...morePopoverHit,
        }
      }

      TODO: address ticket where event refreshing closes popover
      */
    } else if (typeof moreLinkClick === 'string') { // a view name
      context.calendarApi.zoomTo(props.date, moreLinkClick)
    }
  }
}
