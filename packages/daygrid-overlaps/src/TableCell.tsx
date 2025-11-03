import { CssDimValue, DayCellContentArg } from '@fullcalendar/core'
import {
  DateMarker,
  DateComponent,
  DateRange,
  buildNavLinkAttrs,
  WeekNumberContainer,
  DayCellContainer,
  DateProfile,
  setRef,
  createFormatter,
  Dictionary,
  EventSegUiInteractionState,
  getUniqueDomId,
  hasCustomDayCellContent,
  addMs,
  DateEnv,
} from '@fullcalendar/core/internal'
import {
  Ref,
  ComponentChildren,
  createElement,
  createRef,
  ComponentChild,
  Fragment,
} from '@fullcalendar/core/preact'
import { TableCellMoreLink } from './TableCellMoreLink.js'
import { TableSegPlacement } from './event-placement.js'

export interface TableCellProps {
  elRef?: Ref<HTMLTableCellElement>
  date: DateMarker
  dateProfile: DateProfile
  extraRenderProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]
  extraDateSpan?: Dictionary
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
  minHeight?: CssDimValue
}

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'narrow' })

export class TableCell extends DateComponent<TableCellProps> {
  private rootElRef = createRef<HTMLElement>()
  state = {
    dayNumberId: getUniqueDomId(),
  }

  render() {
    let { context, props, state, rootElRef } = this
    let { options, dateEnv } = context
    let { date, dateProfile } = props

    // TODO: memoize this?
    const isMonthStart = props.showDayNumber &&
      shouldDisplayMonthStart(date, dateProfile.currentRange, dateEnv)

    return (
      <DayCellContainer
        elTag="td"
        elRef={this.handleRootEl}
        elClasses={[
          'fc-daygrid-day',
          ...(props.extraClassNames || []),
        ]}
        elAttrs={{
          ...props.extraDataAttrs,
          ...(props.showDayNumber ? { 'aria-labelledby': state.dayNumberId } : {}),
          role: 'gridcell',
        }}
        defaultGenerator={renderTopInner}
        date={date}
        dateProfile={dateProfile}
        todayRange={props.todayRange}
        showDayNumber={props.showDayNumber}
        isMonthStart={isMonthStart}
        extraRenderProps={props.extraRenderProps}
      >
        {(InnerContent, renderProps) => (
          <div
            ref={props.innerElRef}
            className="fc-daygrid-day-frame fc-scrollgrid-sync-inner"
            style={{ minHeight: props.minHeight }}
          >
            {props.showWeekNumber && (
              <WeekNumberContainer
                elTag="a"
                elClasses={['fc-daygrid-week-number']}
                elAttrs={buildNavLinkAttrs(context, date, 'week')}
                date={date}
                defaultFormat={DEFAULT_WEEK_NUM_FORMAT}
              />
            )}
            {!renderProps.isDisabled &&
              (props.showDayNumber || hasCustomDayCellContent(options) || props.forceDayTop) ? (
                <div className="fc-daygrid-day-top">
                  <InnerContent
                    elTag="a"
                    elClasses={[
                      'fc-daygrid-day-number',
                      isMonthStart && 'fc-daygrid-month-start',
                    ]}
                    elAttrs={{
                      ...buildNavLinkAttrs(context, date),
                      id: state.dayNumberId,
                    }}
                  />
                </div>
              ) : props.showDayNumber ? (
                // for creating correct amount of space (see issue #7162)
                <div className="fc-daygrid-day-top" style={{ visibility: 'hidden' }}>
                  <a className="fc-daygrid-day-number">&nbsp;</a>
                </div>
              ) : undefined}
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
        )}
      </DayCellContainer>
    )
  }

  handleRootEl = (el: HTMLElement) => {
    setRef(this.rootElRef, el)
    setRef(this.props.elRef, el)
  }
}

function renderTopInner(props: DayCellContentArg): ComponentChild {
  return props.dayNumberText || <Fragment>&nbsp;</Fragment>
}

function shouldDisplayMonthStart(date: DateMarker, currentRange: DateRange, dateEnv: DateEnv): boolean {
  const { start: currentStart, end: currentEnd } = currentRange
  const currentEndIncl = addMs(currentEnd, -1)
  const currentFirstYear = dateEnv.getYear(currentStart)
  const currentFirstMonth = dateEnv.getMonth(currentStart)
  const currentLastYear = dateEnv.getYear(currentEndIncl)
  const currentLastMonth = dateEnv.getMonth(currentEndIncl)

  // spans more than one month?
  return !(currentFirstYear === currentLastYear && currentFirstMonth === currentLastMonth) &&
    Boolean(
      // first date in current view?
      date.valueOf() === currentStart.valueOf() ||
      // a month-start that's within the current range?
      (dateEnv.getDay(date) === 1 && date.valueOf() < currentEnd.valueOf()),
    )
}
