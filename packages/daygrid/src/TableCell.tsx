import {
  DateMarker,
  DateComponent,
  DateRange,
  buildNavLinkAttrs,
  WeekNumberRoot,
  DayCellRoot,
  DateProfile,
  setRef,
  createFormatter,
  Dictionary,
  EventSegUiInteractionState,
  getUniqueDomId,
} from '@fullcalendar/core'
import {
  Ref,
  ComponentChildren,
  createElement,
  createRef
} from '@fullcalendar/core/preact'
import { TableCellTop } from './TableCellTop'
import { TableCellMoreLink } from './TableCellMoreLink'
import { TableSegPlacement } from './event-placement'

export interface TableCellProps {
  date: DateMarker
  dateProfile: DateProfile
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]
  extraDateSpan?: Dictionary
  elRef?: Ref<HTMLTableCellElement>
  innerElRef?: Ref<HTMLDivElement>
  bgContent: ComponentChildren
  fgContentElRef?: Ref<HTMLDivElement> // TODO: rename!!! classname confusion. is the "event" div
  fgContent: ComponentChildren
  moreCnt: number
  moreMarginTop: number
  showDayNumber: boolean
  showWeekNumber: boolean
  forceDayTop: boolean
  todayRange: DateRange
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
  singlePlacements: TableSegPlacement[]
}

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'narrow' })

export class TableCell extends DateComponent<TableCellProps> {
  private rootElRef = createRef<HTMLElement>()
  state = {
    dayNumberId: getUniqueDomId(),
  }

  render() {
    let { context, props, state, rootElRef } = this
    let { date, dateProfile } = props
    let navLinkAttrs = buildNavLinkAttrs(context, date, 'week')

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
            role="gridcell"
            className={['fc-daygrid-day'].concat(dayClassNames, props.extraClassNames || []).join(' ')}
            {...rootDataAttrs}
            {...props.extraDataAttrs}
            {...(props.showDayNumber ? { 'aria-labelledby': state.dayNumberId } : {})}
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
                  dayNumberId={state.dayNumberId}
                  forceDayTop={props.forceDayTop}
                  todayRange={props.todayRange}
                  extraHookProps={props.extraHookProps}
                />
              )}
              <div
                className="fc-daygrid-day-events"
                ref={props.fgContentElRef}
              >
                {props.fgContent}
                <div className="fc-daygrid-day-bottom" style={{ marginTop: props.moreMarginTop }}>
                  <TableCellMoreLink
                    allDayDate={date}
                    singlePlacements={props.singlePlacements}
                    moreCnt={props.moreCnt}
                    alignmentElRef={rootElRef}
                    alignGridTop={!props.showDayNumber}
                    extraDateSpan={props.extraDateSpan}
                    dateProfile={props.dateProfile}
                    eventSelection={props.eventSelection}
                    eventDrag={props.eventDrag}
                    eventResize={props.eventResize}
                    todayRange={props.todayRange}
                  />
                </div>
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
    setRef(this.rootElRef, el)
    setRef(this.props.elRef, el)
  }
}
