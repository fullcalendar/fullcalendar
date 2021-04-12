import {
  Ref,
  ComponentChildren,
  createElement,
  DateMarker,
  DateComponent,
  CssDimValue,
  DateRange,
  buildNavLinkData,
  RenderHook,
  WeekNumberRoot,
  DayCellRoot,
  DateProfile,
  VUIEvent,
  setRef,
  createFormatter,
  ViewApi,
  Dictionary,
  MountArg,
  addDays,
  intersectRanges,
  EventRenderRange,
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
  buildMoreLinkText: (num: number) => string
  onMoreClick?: (arg: MoreLinkArg) => void
  segPlacements: TableSegPlacement[]
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
      view: viewApi,
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
                    <RenderHook<MoreLinkContentArg> // needed?
                      hookProps={hookProps}
                      classNames={options.moreLinkClassNames}
                      content={options.moreLinkContent}
                      defaultContent={renderMoreLinkInner}
                      didMount={options.moreLinkDidMount}
                      willUnmount={options.moreLinkWillUnmount}
                    >
                      {(rootElRef, classNames, innerElRef, innerContent) => (
                        <a
                          ref={rootElRef}
                          className={['fc-daygrid-more-link'].concat(classNames).join(' ')}
                          onClick={this.handleMoreLinkClick}
                        >
                          {innerContent}
                        </a>
                      )}
                    </RenderHook>
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
    let { segPlacements, onMoreClick, date, moreCnt } = this.props
    let dayRange: DateRange = { start: date, end: addDays(date, 1) }

    if (onMoreClick) {
      let allSegs: TableSeg[] = []
      let hiddenSegs: TableSeg[] = []

      for (let placement of segPlacements) {
        let reslicedSeg = resliceSeg(placement.seg, dayRange)

        if (reslicedSeg) {
          allSegs.push(reslicedSeg)

          if (placement.isHidden) {
            hiddenSegs.push(reslicedSeg)
          }
        }
      }

      onMoreClick({
        date,
        allSegs,
        hiddenSegs,
        moreCnt,
        dayEl: this.rootEl,
        ev,
      })
    }
  }
}

TableCell.addPropsEquality({
  onMoreClick: true, // never forces rerender
})

function renderMoreLinkInner(props) {
  return props.text
}

function resliceSeg(seg: TableSeg, constraint: DateRange): TableSeg | null {
  let eventRange = seg.eventRange
  let origRange = eventRange.range
  let slicedRange = intersectRanges(origRange, constraint)

  if (slicedRange) {
    return {
      ...seg,
      firstCol: -1, // we don't know. caller doesn't care
      lastCol: -1, // we don't know. caller doesn't care
      eventRange: {
        def: eventRange.def,
        ui: { ...eventRange.ui, durationEditable: false }, // hack to disable resizing
        instance: eventRange.instance,
        range: slicedRange,
      } as EventRenderRange,
      isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(),
      isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf(),
    }
  }

  return null
}
