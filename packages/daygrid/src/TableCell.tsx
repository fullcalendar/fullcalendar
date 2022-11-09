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
  DayCellContentArg,
  hasCustomDayCellContent,
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
        extraRenderProps={props.extraRenderProps}
      >
        {(InnerContent, renderProps) => (
          <div className="fc-daygrid-day-frame fc-scrollgrid-sync-inner" ref={props.innerElRef}>
            {props.showWeekNumber && (
              <WeekNumberContainer
                elTag="a"
                elClasses={['fc-daygrid-week-number']}
                elAttrs={buildNavLinkAttrs(context, date, 'week')}
                date={date}
                defaultFormat={DEFAULT_WEEK_NUM_FORMAT}
              />
            )}
            {Boolean(
              !renderProps.isDisabled &&
              (props.showDayNumber || hasCustomDayCellContent(options) || props.forceDayTop),
            ) && (
              <div className="fc-daygrid-day-top">
                <InnerContent
                  elTag="a"
                  elClasses={['fc-daygrid-day-number']}
                  elAttrs={{
                    ...buildNavLinkAttrs(context, date),
                    id: state.dayNumberId,
                  }}
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
