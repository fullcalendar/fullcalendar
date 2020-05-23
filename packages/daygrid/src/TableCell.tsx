import {
  Ref,
  ComponentChildren,
  createElement,
  DateMarker,
  DateComponent,
  CssDimValue,
  DateRange,
  buildNavLinkData,
  DayCellHookProps,
  RenderHook,
  WeekNumberRoot,
  DayCellRoot,
  DayCellContent,
  BaseComponent,
  DateProfile,
  VUIEvent,
  setRef,
  createFormatter,
  ViewApi,
} from '@fullcalendar/common'
import { TableSeg } from './TableSeg'


export interface TableCellProps {
  date: DateMarker
  dateProfile: DateProfile
  extraHookProps?: object
  extraDataAttrs?: object
  extraClassNames?: string[]
  elRef?: Ref<HTMLTableCellElement>
  innerElRef?: Ref<HTMLDivElement>
  bgContent: ComponentChildren
  fgContentElRef?: Ref<HTMLDivElement> // TODO: rename!!! classname confusion. is the "event" div
  fgContent: ComponentChildren
  fgPaddingBottom: CssDimValue
  // hasEvents: boolean // TODO: when reviving, event should "have events" even when none *start* on the cell
  moreCnt: number
  moreMarginTop: number
  showDayNumber: boolean
  showWeekNumber: boolean
  todayRange: DateRange
  buildMoreLinkText: (num: number) => string
  onMoreClick?: (arg: MoreLinkArg) => void
  segsByEachCol: TableSeg[] // for more-popover. includes segs that aren't rooted in this cell but that pass over it
  segIsHidden: { [instanceId: string]: boolean } // for more-popover. TODO: rename to be about selected instances
}

export interface TableCellModel { // TODO: move somewhere else. combine with DayTableCell?
  key: string
  date: DateMarker
  extraHookProps?: object
  extraDataAttrs?: object
  extraClassNames?: string[]
}

export interface MoreLinkArg {
  date: DateMarker
  allSegs: TableSeg[]
  hiddenSegs: TableSeg[]
  moreCnt: number
  dayEl: HTMLElement
  ev: VUIEvent
}

export interface HookProps {
  date: Date
  isPast: boolean
  isFuture: boolean
  isToday: boolean
}

export interface MoreLinkHookProps {
  num: number
  text: string
  view: ViewApi
}

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'narrow' })


export class TableCell extends DateComponent<TableCellProps> {

  private rootEl: HTMLElement


  render() {
    let { options, viewApi } = this.context
    let { props } = this
    let { date, dateProfile } = props

    let hookProps: MoreLinkHookProps = {
      num: props.moreCnt,
      text: props.buildMoreLinkText(props.moreCnt),
      view: viewApi
    }

    return (
      <DayCellRoot
        date={date}
        dateProfile={dateProfile}
        todayRange={props.todayRange}
        showDayNumber={props.showDayNumber}
        extraHookProps={props.extraHookProps}
        elRef={this.handleRootEl}
      >
        {(rootElRef, classNames, rootDataAttrs, isDisabled) => (
          <td
            ref={rootElRef}
            className={[ 'fc-daygrid-day' ].concat(classNames, props.extraClassNames || []).join(' ')}
            {...rootDataAttrs}
            {...props.extraDataAttrs}
          >
            <div className='fc-daygrid-day-frame fc-scrollgrid-sync-inner' ref={props.innerElRef /* different from hook system! RENAME */}>
              {props.showWeekNumber &&
                <WeekNumberRoot date={date} defaultFormat={DEFAULT_WEEK_NUM_FORMAT}>
                  {(rootElRef, classNames, innerElRef, innerContent) => (
                    <a
                      ref={rootElRef}
                      className={[ 'fc-daygrid-week-number' ].concat(classNames).join(' ')}
                      data-navlink={options.navLinks ? buildNavLinkData(date, 'week') : null}
                    >
                      {innerContent}
                    </a>
                  )}
                </WeekNumberRoot>
              }
              {!isDisabled &&
                <TableCellTop
                  date={date}
                  dateProfile={dateProfile}
                  showDayNumber={props.showDayNumber}
                  todayRange={props.todayRange}
                  extraHookProps={props.extraHookProps}
                />
              }
              <div
                className='fc-daygrid-day-events'
                ref={props.fgContentElRef}
                style={{ paddingBottom: props.fgPaddingBottom }}
              >
                {props.fgContent}
                {Boolean(props.moreCnt) &&
                  <div className='fc-daygrid-day-bottom' style={{ marginTop: props.moreMarginTop }}>
                    <RenderHook<MoreLinkHookProps> // needed?
                      hookProps={hookProps}
                      classNames={options.moreLinkClassNames}
                      content={options.moreLinkContent}
                      defaultContent={renderMoreLinkInner}
                      didMount={options.moreLinkDidMount}
                      willUnmount={options.moreLinkWillUnmount}
                    >
                      {(rootElRef, classNames, innerElRef, innerContent) => (
                        <a onClick={this.handleMoreLinkClick} ref={rootElRef} className={[ 'fc-daygrid-more-link' ].concat(classNames).join(' ')}>
                          {innerContent}
                        </a>
                      )}
                    </RenderHook>
                  </div>
                }
              </div>
              <div className='fc-daygrid-day-bg'>
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
    let { props } = this

    if (props.onMoreClick) {
      let allSegs = props.segsByEachCol
      let hiddenSegs = allSegs.filter(
        (seg: TableSeg) => props.segIsHidden[seg.eventRange.instance.instanceId]
      )

      props.onMoreClick({
        date: props.date,
        allSegs,
        hiddenSegs,
        moreCnt: props.moreCnt,
        dayEl: this.rootEl,
        ev
      })
    }
  }

}


function renderTopInner(props: DayCellHookProps) {
  return props.dayNumberText
}


function renderMoreLinkInner(props) {
  return props.text
}


interface TableCellTopProps {
  date: DateMarker
  dateProfile: DateProfile
  showDayNumber: boolean
  todayRange: DateRange
  extraHookProps?: object
}

class TableCellTop extends BaseComponent<TableCellTopProps> {

  render() {
    let { props } = this

    return (
      <DayCellContent
        date={props.date}
        dateProfile={props.dateProfile}
        todayRange={props.todayRange}
        showDayNumber={props.showDayNumber}
        extraHookProps={props.extraHookProps}
        defaultContent={renderTopInner}
      >
        {(innerElRef, innerContent) => (
          innerContent &&
            <div className='fc-daygrid-day-top' ref={innerElRef}>
              <a
                className='fc-daygrid-day-number'
                data-navlink={this.context.options.navLinks ? buildNavLinkData(props.date) : null}
              >
                {innerContent}
              </a>
            </div>
        )}
      </DayCellContent>
    )
  }

}
