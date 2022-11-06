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
  DayCellContentArg,
  hasCustomDayCellContent,
} from '@fullcalendar/core'
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
  date: DateMarker
  dateProfile: DateProfile
  extraRenderProps?: Dictionary
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
    let { options } = context
    let { date, dateProfile } = props
    let navLinkAttrs = buildNavLinkAttrs(context, date, 'week')

    return (
      <DayCellRoot
        elTag="td"
        elClasses={[
          'fc-daygrid-day',
          ...(props.extraClassNames || []),
        ]}
        elAttrs={{
          role: 'gridcell',
          ...props.extraDataAttrs,
          ...(props.showDayNumber ? { 'aria-labelledby': state.dayNumberId } : {}),
        }}
        elRef={this.handleRootEl}
        defaultGenerator={renderTopInner}
        date={date}
        dateProfile={dateProfile}
        todayRange={props.todayRange}
        showDayNumber={props.showDayNumber}
        extraRenderProps={props.extraRenderProps}
      >
        {(InnerContent, renderProps) => (
          <div className="fc-daygrid-day-frame fc-scrollgrid-sync-inner" ref={props.innerElRef}>
            {props.showWeekNumber && (
              <WeekNumberRoot
                elTag="a"
                elClasses={['fc-daygrid-week-number']}
                elAttrs={navLinkAttrs}
                date={date}
                defaultFormat={DEFAULT_WEEK_NUM_FORMAT}
              />
            )}
            {Boolean(
              !renderProps.isDisabled &&
              (hasCustomDayCellContent(options) || props.forceDayTop),
            ) && (
              <div className="fc-daygrid-day-top">
                <InnerContent
                  elTag="a"
                  elClasses={['fc-daygrid-day-number']}
                  elAttrs={navLinkAttrs}
                />
              </div>
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
        )}
      </DayCellRoot>
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
