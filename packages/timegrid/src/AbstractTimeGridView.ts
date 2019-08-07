import {
  findElements, createElement, htmlEscape,
  matchCellWidths, uncompensateScroll, compensateScroll, subtractInnerElHeight,
  ScrollComponent,
  View, ViewSpec, DateProfileGenerator,
  ComponentContext,
  createFormatter, diffDays,
  buildGotoAnchorHtml, getAllDayHtml, Duration
} from '@fullcalendar/core'
import { DayGrid } from '@fullcalendar/daygrid'
import TimeGrid from './TimeGrid'
import AllDaySplitter from './AllDaySplitter'

const TIMEGRID_ALL_DAY_EVENT_LIMIT = 5
const WEEK_HEADER_FORMAT = createFormatter({ week: 'short' })


/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default abstract class TimeGridView extends View {

  timeGrid: TimeGrid // the main time-grid subcomponent of this view
  dayGrid: DayGrid // the "all-day" subcomponent. if all-day is turned off, this will be null

  scroller: ScrollComponent
  axisWidth: any // the width of the time axis running down the side

  protected splitter = new AllDaySplitter()


  constructor(
    context: ComponentContext,
    viewSpec: ViewSpec,
    dateProfileGenerator: DateProfileGenerator,
    parentEl: HTMLElement
  ) {
    super(context, viewSpec, dateProfileGenerator, parentEl)

    this.el.classList.add('fc-timeGrid-view')
    this.el.innerHTML = this.renderSkeletonHtml()

    this.scroller = new ScrollComponent(
      'hidden', // overflow x
      'auto' // overflow y
    )

    let timeGridWrapEl = this.scroller.el
    this.el.querySelector('.fc-body > tr > td').appendChild(timeGridWrapEl)
    timeGridWrapEl.classList.add('fc-time-grid-container')
    let timeGridEl = createElement('div', { className: 'fc-time-grid' })
    timeGridWrapEl.appendChild(timeGridEl)

    this.timeGrid = new TimeGrid(
      this.context,
      timeGridEl,
      {
        renderBgIntroHtml: this.renderTimeGridBgIntroHtml,
        renderIntroHtml: this.renderTimeGridIntroHtml
      }
    )

    if (this.opt('allDaySlot')) { // should we display the "all-day" area?

      this.dayGrid = new DayGrid( // the all-day subcomponent of this view
        this.context,
        this.el.querySelector('.fc-day-grid'),
        {
          renderNumberIntroHtml: this.renderDayGridIntroHtml, // don't want numbers
          renderBgIntroHtml: this.renderDayGridBgIntroHtml,
          renderIntroHtml: this.renderDayGridIntroHtml,
          colWeekNumbersVisible: false,
          cellWeekNumbersVisible: false
        }
      )

      // have the day-grid extend it's coordinate area over the <hr> dividing the two grids
      let dividerEl = this.el.querySelector('.fc-divider') as HTMLElement
      this.dayGrid.bottomCoordPadding = dividerEl.getBoundingClientRect().height
    }
  }


  destroy() {
    super.destroy()

    this.timeGrid.destroy()

    if (this.dayGrid) {
      this.dayGrid.destroy()
    }

    this.scroller.destroy()
  }


  /* Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Builds the HTML skeleton for the view.
  // The day-grid and time-grid components will render inside containers defined by this HTML.
  renderSkeletonHtml() {
    let { theme } = this

    return '' +
      '<table class="' + theme.getClass('tableGrid') + '">' +
        (this.opt('columnHeader') ?
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
              (this.opt('allDaySlot') ?
                '<div class="fc-day-grid"></div>' +
                '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" />' :
                ''
                ) +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
  }


  /* Now Indicator
  ------------------------------------------------------------------------------------------------------------------*/


  getNowIndicatorUnit() {
    return this.timeGrid.getNowIndicatorUnit()
  }


  // subclasses should implement
  // renderNowIndicator(date: DateMarker) {
  // }


  unrenderNowIndicator() {
    this.timeGrid.unrenderNowIndicator()
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  updateSize(isResize: boolean, viewHeight: number, isAuto: boolean) {
    super.updateSize(isResize, viewHeight, isAuto) // will call updateBaseSize. important that executes first

    this.timeGrid.updateSize(isResize)

    if (this.dayGrid) {
      this.dayGrid.updateSize(isResize)
    }
  }


  // Adjusts the vertical dimensions of the view to the specified values
  updateBaseSize(isResize, viewHeight, isAuto) {
    let eventLimit
    let scrollerHeight
    let scrollbarWidths

    // make all axis cells line up
    this.axisWidth = matchCellWidths(findElements(this.el, '.fc-axis'))

    // hack to give the view some height prior to timeGrid's columns being rendered
    // TODO: separate setting height from scroller VS timeGrid.
    if (!this.timeGrid.colEls) {
      if (!isAuto) {
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        this.scroller.setHeight(scrollerHeight)
      }
      return
    }

    // set of fake row elements that must compensate when scroller has scrollbars
    let noScrollRowEls: HTMLElement[] = findElements(this.el, '.fc-row').filter((node) => {
      return !this.scroller.el.contains(node)
    })

    // reset all dimensions back to the original state
    this.timeGrid.bottomRuleEl.style.display = 'none' // will be shown later if this <hr> is necessary
    this.scroller.clear() // sets height to 'auto' and clears overflow
    noScrollRowEls.forEach(uncompensateScroll)

    // limit number of events in the all-day area
    if (this.dayGrid) {
      this.dayGrid.removeSegPopover() // kill the "more" popover if displayed

      eventLimit = this.opt('eventLimit')
      if (eventLimit && typeof eventLimit !== 'number') {
        eventLimit = TIMEGRID_ALL_DAY_EVENT_LIMIT // make sure "auto" goes to a real number
      }
      if (eventLimit) {
        this.dayGrid.limitRows(eventLimit)
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
      if (this.timeGrid.getTotalSlatHeight() < scrollerHeight) {
        this.timeGrid.bottomRuleEl.style.display = ''
      }
    }
  }


  // given a desired total height of the view, returns what the height of the scroller should be
  computeScrollerHeight(viewHeight) {
    return viewHeight -
      subtractInnerElHeight(this.el, this.scroller.el) // everything that's NOT the scroller
  }


  /* Scroll
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes the initial pre-configured scroll state prior to allowing the user to change it
  computeDateScroll(duration: Duration) {
    let top = this.timeGrid.computeTimeTop(duration)

    // zoom can give weird floating-point values. rather scroll a little bit further
    top = Math.ceil(top)

    if (top) {
      top++ // to overcome top border that slots beyond the first have. looks better
    }

    return { top }
  }


  queryDateScroll() {
    return { top: this.scroller.getScrollTop() }
  }


  applyDateScroll(scroll) {
    if (scroll.top !== undefined) {
      this.scroller.setScrollTop(scroll.top)
    }
  }


  /* Header Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntroHtml = () => {
    let { theme, dateEnv } = this
    let range = this.props.dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)
    let weekText

    if (this.opt('weekNumbers')) {
      weekText = dateEnv.format(range.start, WEEK_HEADER_FORMAT)

      return '' +
        '<th class="fc-axis fc-week-number ' + theme.getClass('widgetHeader') + '" ' + this.axisStyleAttr() + '>' +
          buildGotoAnchorHtml( // aside from link, important for matchCellWidths
            this,
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


  /* Time Grid Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
  renderTimeGridBgIntroHtml = () => {
    let { theme } = this

    return '<td class="fc-axis ' + theme.getClass('widgetContent') + '" ' + this.axisStyleAttr() + '></td>'
  }


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderTimeGridIntroHtml = () => {
    return '<td class="fc-axis" ' + this.axisStyleAttr() + '></td>'
  }


  /* Day Grid Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that goes before the all-day cells
  renderDayGridBgIntroHtml = () => {
    let { theme } = this

    return '' +
      '<td class="fc-axis ' + theme.getClass('widgetContent') + '" ' + this.axisStyleAttr() + '>' +
        '<span>' + // needed for matchCellWidths
          getAllDayHtml(this) +
        '</span>' +
      '</td>'
  }


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderDayGridIntroHtml = () => {
    return '<td class="fc-axis" ' + this.axisStyleAttr() + '></td>'
  }

}

TimeGridView.prototype.usesMinMaxTime = true // indicates that minTime/maxTime affects rendering
