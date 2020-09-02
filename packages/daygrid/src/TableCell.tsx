import {
  Ref,
  ComponentChildren,
  createElement,
  DateMarker,
  DateComponent,
  CssDimValue,
  DateRange,
  buildNavLinkData,
  DayCellContentArg,
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
  Dictionary,
  MountArg,
  Fragment,
} from '@fullcalendar/common'
import { TableSeg } from './TableSeg'


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
  // hasEvents: boolean // TODO: when reviving, event should "have events" even when none *start* on the cell
  moreCnt: number
  moreMarginTop: number
  showDayNumber: boolean
  showWeekNumber: boolean
  forceDayTop: boolean
  todayRange: DateRange
  buildMoreLinkText: (num: number) => string
  onMoreClick?: (arg: MoreLinkArg) => void
  segsByEachCol: TableSeg[] // for more-popover. includes segs that aren't rooted in this cell but that pass over it
  segIsHidden: { [instanceId: string]: boolean } // for more-popover. TODO: rename to be about selected instances
}

export interface TableCellModel { // TODO: move somewhere else. combine with DayTableCell?
  key: string
  date: DateMarker
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
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

export interface MoreLinkContentArg {
  num: number
  text: string
  view: ViewApi
}

export type MoreLinkMountArg = MountArg<MoreLinkContentArg>

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'narrow' })


export class TableCell extends DateComponent<TableCellProps> {

  private rootEl: HTMLElement


  render() {
    let { options, viewApi } = this.context
    let { props } = this
    let { date, dateProfile } = props

    let hookProps: MoreLinkContentArg = {
      num: props.moreCnt,
      text: props.buildMoreLinkText(props.moreCnt),
      view: viewApi
    }

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
        {(rootElRef, classNames, rootDataAttrs, isDisabled) => (
          <td
            ref={rootElRef}
            className={[ 'fc-daygrid-day' ].concat(classNames, props.extraClassNames || []).join(' ')}
            {...rootDataAttrs}
            {...props.extraDataAttrs}
            style={ options.dayCellStyle ? options.dayCellStyle : { } }
          >
            <div className='fc-daygrid-day-frame fc-scrollgrid-sync-inner'
                 ref={props.innerElRef /* different from hook system! RENAME */}
                 style={ options.dayGridDayFrameStyle ? options.dayGridDayFrameStyle : { } }>
              {props.showWeekNumber &&
                <WeekNumberRoot date={date} defaultFormat={DEFAULT_WEEK_NUM_FORMAT}>
                  {(rootElRef, classNames, innerElRef, innerContent) => (
                    <a
                      ref={rootElRef}
                      className={[ 'fc-daygrid-week-number' ].concat(classNames).join(' ')}
                      {...navLinkAttrs}
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
                  forceDayTop={props.forceDayTop}
                  todayRange={props.todayRange}
                  extraHookProps={props.extraHookProps}
                />
              }

              <div
                className='fc-daygrid-day-events'
                ref={props.fgContentElRef}
                style={{ paddingBottom: props.fgPaddingBottom }}
              >
                {!options.hideEventContent && props.fgContent }
                {Boolean(props.moreCnt && !options.hideMoreContentLink) &&
                  <div className='fc-daygrid-day-bottom' style={{ marginTop: props.moreMarginTop }}>
                    <RenderHook<MoreLinkContentArg> // needed?
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


function renderTopInner(props: DayCellContentArg) {
  return props.dayNumberText
}


function renderMoreLinkInner(props) {
  return props.text
}


interface TableCellTopProps {
  date: DateMarker
  dateProfile: DateProfile
  showDayNumber: boolean
  forceDayTop: boolean // hack to force-create an element with height (created by a nbsp)
  todayRange: DateRange
  extraHookProps?: Dictionary
}

class TableCellTop extends BaseComponent<TableCellTopProps> {

  render() {
    let { props } = this

    const options = this.context.options;
    let navLinkAttrs = options.navLinks
      ? { 'data-navlink': buildNavLinkData(props.date), tabIndex: 0 }
      : {}

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
          (innerContent || props.forceDayTop) &&
            <div className='fc-daygrid-day-top' ref={innerElRef}
                 style={ options.dayGridDayTopStyle ? options.dayGridDayTopStyle : { } }>
              <a className='fc-daygrid-day-number' {...navLinkAttrs}>
                {innerContent || <Fragment>&nbsp;</Fragment>}
              </a>
            </div>
        )}
      </DayCellContent>
    )
  }

}
