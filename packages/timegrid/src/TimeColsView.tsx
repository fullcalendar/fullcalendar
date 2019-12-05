import {
  h, ComponentChildren, createRef,
  findElements,
  matchCellWidths, uncompensateScroll, compensateScroll, subtractInnerElHeight,
  Scroller,
  View,
  createFormatter, diffDays,
  Duration,
  DateMarker,
  getViewClassNames,
  GotoAnchor,
  ViewProps
} from '@fullcalendar/core'
import { Table } from '@fullcalendar/daygrid'
import { TimeCols } from './main'
import AllDaySplitter from './AllDaySplitter'


const ALL_DAY_EVENT_LIMIT = 5
const WEEK_HEADER_FORMAT = createFormatter({ week: 'short' })


/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeCols subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default abstract class TimeColsView extends View {

  protected allDaySplitter = new AllDaySplitter() // for use by subclasses

  private rootElRef = createRef<HTMLDivElement>()
  private dividerElRef = createRef<HTMLHRElement>()
  private scrollerRef = createRef<Scroller>()
  private axisWidth: any // the width of the time axis running down the side


  // abstract requirements
  // ----------------------------------------------------------------------------------------------------

  abstract getAllDayTableObj(): { table: Table } | null

  abstract getTimeColsObj(): {
    timeCols: TimeCols,
    getNowIndicatorUnit: () => string,
    renderNowIndicator: (d: DateMarker) => void,
    unrenderNowIndicator: () => void
  }


  // rendering
  // ----------------------------------------------------------------------------------------------------


  renderLayout(
    headerChildren: ComponentChildren | null,
    allDayChildren: ComponentChildren | null,
    timeChildren: ComponentChildren
  ) {
    let { theme } = this.context
    let classNames = getViewClassNames(this.props.viewSpec).concat('fc-timeGrid-view')

    return (
      <div class={classNames.join(' ')} ref={this.rootElRef}>
        <table class={theme.getClass('tableGrid')}>
          {headerChildren &&
            <thead class='fc-head'>
              <tr>
                <td class={'fc-head-container ' + theme.getClass('widgetHeader')}>
                  {headerChildren}
                </td>
              </tr>
            </thead>
          }
          <tbody class='fc-body'>
            <tr>
              <td class={theme.getClass('widgetContent')}>
                {allDayChildren}
                {allDayChildren &&
                  <hr class={'fc-divider ' + theme.getClass('widgetHeader')} ref={this.dividerElRef}/>
                }
                <Scroller
                  ref={this.scrollerRef}
                  overflowX='hidden'
                  overflowY='auto'
                  extraClassName='fc-time-grid-container'
                >
                  {timeChildren}
                </Scroller>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }


  componentDidMount() {
    let allDayTable = this.getAllDayTableObj()
    let dividerEl = this.dividerElRef.current

    if (allDayTable) {
      allDayTable.table.bottomCoordPadding = dividerEl.getBoundingClientRect().height
    }

    this.startNowIndicator()
    this.scrollToInitialTime()
  }


  getSnapshotBeforeUpdate() {
    let scroller = this.scrollerRef.current

    return { scrollTop: scroller.controller.getScrollTop() }
  }


  componentDidUpdate(prevProps: ViewProps, prevState: {}, snapshot) {

    if (prevProps.dateProfile !== this.props.dateProfile) {
      this.scrollToInitialTime()

    } else {
      this.scrollTop(snapshot.scrollTop)
    }
  }


  componentWillUnmount() {
    this.stopNowIndicator()
  }


  /* Now Indicator
  ------------------------------------------------------------------------------------------------------------------*/


  getNowIndicatorUnit() {
    return this.getTimeColsObj().getNowIndicatorUnit()
  }


  renderNowIndicator(date) {
    this.getTimeColsObj().renderNowIndicator(date)
  }


  unrenderNowIndicator() {
    this.getTimeColsObj().unrenderNowIndicator()
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  abstract updateSize(isResize: boolean, viewHeight: number, isAuto: boolean)


  // Adjusts the vertical dimensions of the view to the specified values
  updateLayoutSize(timeCols: TimeCols, table: Table | null, viewHeight, isAuto) {
    let rootEl = this.rootElRef.current
    let scroller = this.scrollerRef.current
    let eventLimit
    let scrollerHeight
    let scrollbarWidths

    // make all axis cells line up
    this.axisWidth = matchCellWidths(findElements(rootEl, '.fc-axis'))

    // hack to give the view some height prior to timeGrid's columns being rendered
    // TODO: separate setting height from scroller VS timeGrid.
    if (!timeCols.colEls) {
      if (!isAuto) {
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        scroller.setHeight(scrollerHeight)
      }
      return
    }

    // set of fake row elements that must compensate when scroller has scrollbars
    let noScrollRowEls: HTMLElement[] = findElements(rootEl, '.fc-row').filter((node) => {
      return !scroller.rootEl.contains(node)
    })

    // reset all dimensions back to the original state
    timeCols.bottomRuleEl.style.display = 'none' // will be shown later if this <hr> is necessary
    scroller.clear() // sets height to 'auto' and clears overflow
    noScrollRowEls.forEach(uncompensateScroll)

    // limit number of events in the all-day area
    if (table) {

      eventLimit = this.context.options.eventLimit
      if (eventLimit && typeof eventLimit !== 'number') {
        eventLimit = ALL_DAY_EVENT_LIMIT // make sure "auto" goes to a real number
      }
      if (eventLimit) {
        table.limitRows(eventLimit)
      }
    }

    if (!isAuto) { // should we force dimensions of the scroll container?

      scrollerHeight = this.computeScrollerHeight(viewHeight)
      scroller.setHeight(scrollerHeight)
      scrollbarWidths = scroller.getScrollbarWidths()

      if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?

        // make the all-day and header rows lines up
        noScrollRowEls.forEach(function(rowEl) {
          compensateScroll(rowEl, scrollbarWidths)
        })

        // the scrollbar compensation might have changed text flow, which might affect height, so recalculate
        // and reapply the desired height to the scroller.
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        scroller.setHeight(scrollerHeight)
      }

      // guarantees the same scrollbar widths
      scroller.lockOverflow(scrollbarWidths)

      // if there's any space below the slats, show the horizontal rule.
      // this won't cause any new overflow, because lockOverflow already called.
      if (timeCols.getTotalSlatHeight() < scrollerHeight) {
        timeCols.bottomRuleEl.style.display = ''
      }
    }
  }


  // given a desired total height of the view, returns what the height of the scroller should be
  computeScrollerHeight(viewHeight) {
    let rootEl = this.rootElRef.current
    let scroller = this.scrollerRef.current

    return viewHeight - subtractInnerElHeight(rootEl, scroller.rootEl) // everything that's NOT the scroller
  }


  /* Scroll
  ------------------------------------------------------------------------------------------------------------------*/


  scrollToTime(duration: Duration) {
    this.afterSizing(() => { // hack
      let top = this.computeDateScroll(duration)

      this.scrollTop(top)
    })
  }


  scrollTop(top: number) {
    this.afterSizing(() => { // hack
      let scroller = this.scrollerRef.current

      scroller.controller.setScrollTop(top)
    })
  }


  // Computes the initial pre-configured scroll state prior to allowing the user to change it
  computeDateScroll(duration: Duration) {
    let top = this.getTimeColsObj().timeCols.computeTimeTop(duration)

    // zoom can give weird floating-point values. rather scroll a little bit further
    top = Math.ceil(top)

    if (top) {
      top++ // to overcome top border that slots beyond the first have. looks better
    }

    return top
  }


  /* Header Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntro = () => {
    let { theme, dateEnv, options } = this.context
    let range = this.props.dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)
    let weekText

    if (options.weekNumbers) {
      weekText = dateEnv.format(range.start, WEEK_HEADER_FORMAT)

      return [
        <th class={'fc-axis fc-week-number ' + theme.getClass('widgetHeader')} style={this.getAxisStyles()}>
          <GotoAnchor
            navLinks={options.navLinks}
            gotoOptions={{ date: range.start, type: 'week', forceOff: dayCnt > 1 }}
          >{weekText}</GotoAnchor>
        </th>
      ]
    }

    return [
      <th class={'fc-axis ' + theme.getClass('widgetHeader')} style={this.getAxisStyles()}></th>
    ]
  }


  // Generates an HTML attribute string for setting the width of the axis, if it is known
  getAxisStyles() {
    if (this.axisWidth != null) {
      return { width: this.axisWidth }
    }
    return {}
  }


  /* TimeCols Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that goes before the bg of the TimeCols slot area. Long vertical column.
  renderTimeColsBgIntro = () => {
    let { theme } = this.context

    return [
      <td class={'fc-axis ' + theme.getClass('widgetContent')} style={this.getAxisStyles()}></td>
    ]
  }


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderTimeColsIntro = () => {
    return [
      <td class='fc-axis' style={this.getAxisStyles()}></td>
    ]
  }


  /* Table Component Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that goes before the all-day cells
  renderTableBgIntro = () => {
    let { theme, options } = this.context
    let spanAttrs = {} as any
    let child = options.allDayText

    if (typeof options.allDayHtml === 'string') {
      spanAttrs.dangerouslySetInnerHTML = { __html: options.allDayHtml }
      child = null
    }

    return [
      <td class={'fc-axis ' + theme.getClass('widgetContent')} style={this.getAxisStyles()}>
        <span {...spanAttrs}>
          {child}
        </span>
      </td>
    ]
  }


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderTableIntro = () => {
    return [
      <td class='fc-axis' style={this.getAxisStyles()}></td>
    ]
  }

}

TimeColsView.prototype.usesMinMaxTime = true // indicates that minTime/maxTime affects rendering
