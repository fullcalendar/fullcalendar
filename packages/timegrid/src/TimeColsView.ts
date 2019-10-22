import {
  findElements, htmlEscape,
  matchCellWidths, uncompensateScroll, compensateScroll, subtractInnerElHeight,
  Scroller,
  View,
  ComponentContext,
  createFormatter, diffDays,
  buildGotoAnchorHtml, getAllDayHtml, Duration,
  DateMarker,
  renderViewEl,
  renderer
} from '@fullcalendar/core'
import { TimeColsRenderProps } from './TimeCols'
import Table, { TableRenderProps } from 'packages/daygrid/src/Table'
import { TimeCols } from './main'
import AllDaySplitter from './AllDaySplitter'

const ALL_DAY_EVENT_LIMIT = 5
const WEEK_HEADER_FORMAT = createFormatter({ week: 'short' })


/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeCols subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default abstract class TimeColsView extends View {

  private renderSkeleton = renderer(this._renderSkeleton)
  private renderScroller = renderer(Scroller)

  protected allDaySplitter = new AllDaySplitter() // for use by subclasses
  private scroller: Scroller
  private axisWidth: any // the width of the time axis running down the side
  private dividerEl: HTMLElement


  abstract getAllDayTableObj(): { table: Table } | null

  abstract getTimeColsObj(): {
    timeCols: TimeCols,
    getNowIndicatorUnit: () => string,
    renderNowIndicator: (d: DateMarker) => void,
    unrenderNowIndicator: () => void
  }


  renderLayout(props: { type: string }, context: ComponentContext) {
    let res = this.renderSkeleton(true, { type: props.type })

    let scroller = this.renderScroller(res.contentWrapEl, {
      overflowX: 'hidden',
      overflowY: 'auto'
    })

    this.scroller = scroller

    return res
  }


  _renderSkeleton(props: { type: string }, context: ComponentContext) {
    let { theme, options } = context

    let el = renderViewEl(props.type)
    el.classList.add('fc-timeGrid-view')
    el.innerHTML = '' +
      '<table class="' + theme.getClass('tableGrid') + '">' +
        (options.columnHeader ?
          '<thead class="fc-head">' +
            '<tr>' +
              '<td class="fc-head-container ' + theme.getClass('widgetHeader') + '">&nbsp;</td>' +
            '</tr>' +
          '</thead>' :
          ''
          ) +
        '<tbody class="fc-body">' +
          '<tr>' +
            '<td class="' + theme.getClass('widgetContent') + '">' +
              (options.allDaySlot ?
                '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" />' :
                ''
                ) +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'

    this.dividerEl = options.allDaySlot ? (el.querySelector('.fc-divider') as HTMLElement) : null

    return {
      rootEl: el,
      headerWrapEl: options.columnHeader ? (el.querySelector('.fc-head-container') as HTMLElement) : null,
      contentWrapEl: el.querySelector('.fc-body > tr > td') as HTMLElement
    }
  }


  componentDidMount() {
    let allDayTable = this.getAllDayTableObj()

    if (allDayTable) {
      allDayTable.table.bottomCoordPadding = this.dividerEl.getBoundingClientRect().height
    }
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
    let eventLimit
    let scrollerHeight
    let scrollbarWidths

    // make all axis cells line up
    this.axisWidth = matchCellWidths(findElements(this.rootEl, '.fc-axis'))

    // hack to give the view some height prior to timeGrid's columns being rendered
    // TODO: separate setting height from scroller VS timeGrid.
    if (!timeCols.colEls) {
      if (!isAuto) {
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        this.scroller.setHeight(scrollerHeight)
      }
      return
    }

    // set of fake row elements that must compensate when scroller has scrollbars
    let noScrollRowEls: HTMLElement[] = findElements(this.rootEl, '.fc-row').filter((node) => {
      return !this.scroller.el.contains(node)
    })

    // reset all dimensions back to the original state
    timeCols.bottomRuleEl.style.display = 'none' // will be shown later if this <hr> is necessary
    this.scroller.clear() // sets height to 'auto' and clears overflow
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
      this.scroller.setHeight(scrollerHeight)
      scrollbarWidths = this.scroller.getScrollbarWidths()

      if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?

        // make the all-day and header rows lines up
        noScrollRowEls.forEach(function(rowEl) {
          compensateScroll(rowEl, scrollbarWidths)
        })

        // the scrollbar compensation might have changed text flow, which might affect height, so recalculate
        // and reapply the desired height to the scroller.
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        this.scroller.setHeight(scrollerHeight)
      }

      // guarantees the same scrollbar widths
      this.scroller.lockOverflow(scrollbarWidths)

      // if there's any space below the slats, show the horizontal rule.
      // this won't cause any new overflow, because lockOverflow already called.
      if (timeCols.getTotalSlatHeight() < scrollerHeight) {
        timeCols.bottomRuleEl.style.display = ''
      }
    }
  }


  // given a desired total height of the view, returns what the height of the scroller should be
  computeScrollerHeight(viewHeight) {
    return viewHeight -
      subtractInnerElHeight(this.rootEl, this.scroller.el) // everything that's NOT the scroller
  }


  /* Scroll
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes the initial pre-configured scroll state prior to allowing the user to change it
  computeDateScroll(duration: Duration) {
    let top = this.getTimeColsObj().timeCols.computeTimeTop(duration)

    // zoom can give weird floating-point values. rather scroll a little bit further
    top = Math.ceil(top)

    if (top) {
      top++ // to overcome top border that slots beyond the first have. looks better
    }

    return { top }
  }


  queryDateScroll() {
    return { top: this.scroller.controller.getScrollTop() }
  }


  applyDateScroll(scroll) {
    if (scroll.top !== undefined) {
      this.scroller.controller.setScrollTop(scroll.top)
    }
  }


  /* Header Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntroHtml = () => {
    let { theme, dateEnv, options } = this.context
    let range = this.props.dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)
    let weekText

    if (options.weekNumbers) {
      weekText = dateEnv.format(range.start, WEEK_HEADER_FORMAT)

      return '' +
        '<th class="fc-axis fc-week-number ' + theme.getClass('widgetHeader') + '" ' + this.axisStyleAttr() + '>' +
          buildGotoAnchorHtml( // aside from link, important for matchCellWidths
            options,
            dateEnv,
            { date: range.start, type: 'week', forceOff: dayCnt > 1 },
            htmlEscape(weekText) // inner HTML
          ) +
        '</th>'
    } else {
      return '<th class="fc-axis ' + theme.getClass('widgetHeader') + '" ' + this.axisStyleAttr() + '></th>'
    }
  }


  // Generates an HTML attribute string for setting the width of the axis, if it is known
  axisStyleAttr() {
    if (this.axisWidth != null) {
      return 'style="width:' + this.axisWidth + 'px"'
    }
    return ''
  }


  /* TimeCols Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that goes before the bg of the TimeCols slot area. Long vertical column.
  renderTimeColsBgIntroHtml = () => {
    let { theme } = this.context

    return '<td class="fc-axis ' + theme.getClass('widgetContent') + '" ' + this.axisStyleAttr() + '></td>'
  }


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderTimeColsIntroHtml = () => {
    return '<td class="fc-axis" ' + this.axisStyleAttr() + '></td>'
  }


  timeColsRenderProps: TimeColsRenderProps = {
    renderBgIntroHtml: this.renderTimeColsBgIntroHtml,
    renderIntroHtml: this.renderTimeColsIntroHtml
  }


  /* Table Component Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that goes before the all-day cells
  renderTableBgIntroHtml = () => {
    let { theme, options } = this.context

    return '' +
      '<td class="fc-axis ' + theme.getClass('widgetContent') + '" ' + this.axisStyleAttr() + '>' +
        '<span>' + // needed for matchCellWidths
          getAllDayHtml(options) +
        '</span>' +
      '</td>'
  }


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderTableIntroHtml = () => {
    return '<td class="fc-axis" ' + this.axisStyleAttr() + '></td>'
  }


  tableRenderProps: TableRenderProps = {
    renderNumberIntroHtml: this.renderTableIntroHtml, // don't want numbers
    renderBgIntroHtml: this.renderTableBgIntroHtml,
    renderIntroHtml: this.renderTableIntroHtml,
    colWeekNumbersVisible: false,
    cellWeekNumbersVisible: false
  }

}

TimeColsView.prototype.usesMinMaxTime = true // indicates that minTime/maxTime affects rendering
