import {
  htmlEscape, createElement, findElements,
  matchCellWidths,
  uncompensateScroll,
  compensateScroll,
  subtractInnerElHeight,
  distributeHeight,
  undistributeHeight,
  createFormatter,
  ScrollComponent,
  View,
  buildGotoAnchorHtml,
  ComponentContext,
  ViewSpec,
  DateProfileGenerator,
  Duration
} from '@fullcalendar/core'
import DayGridDateProfileGenerator from './DayGridDateProfileGenerator'
import DayGrid from './DayGrid'

const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


/* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a DayGrid subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.

export default abstract class DayGridView extends View {

  scroller: ScrollComponent
  dayGrid: DayGrid // the main subcomponent that does most of the heavy lifting

  colWeekNumbersVisible: boolean
  weekNumberWidth: number


  constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement) {
    super(context, viewSpec, dateProfileGenerator, parentEl)

    this.el.classList.add('fc-dayGrid-view')
    this.el.innerHTML = this.renderSkeletonHtml()

    this.scroller = new ScrollComponent(
      'hidden', // overflow x
      'auto' // overflow y
    )

    let dayGridContainerEl = this.scroller.el
    this.el.querySelector('.fc-body > tr > td').appendChild(dayGridContainerEl)
    dayGridContainerEl.classList.add('fc-day-grid-container')
    let dayGridEl = createElement('div', { className: 'fc-day-grid' })
    dayGridContainerEl.appendChild(dayGridEl)

    let cellWeekNumbersVisible

    if (this.opt('weekNumbers')) {
      if (this.opt('weekNumbersWithinDays')) {
        cellWeekNumbersVisible = true
        this.colWeekNumbersVisible = false
      } else {
        cellWeekNumbersVisible = false
        this.colWeekNumbersVisible = true
      }
    } else {
      this.colWeekNumbersVisible = false
      cellWeekNumbersVisible = false
    }

    this.dayGrid = new DayGrid(
      this.context,
      dayGridEl,
      {
        renderNumberIntroHtml: this.renderDayGridNumberIntroHtml,
        renderBgIntroHtml: this.renderDayGridBgIntroHtml,
        renderIntroHtml: this.renderDayGridIntroHtml,
        colWeekNumbersVisible: this.colWeekNumbersVisible,
        cellWeekNumbersVisible
      }
    )
  }


  destroy() {
    super.destroy()

    this.dayGrid.destroy()
    this.scroller.destroy()
  }

  // Builds the HTML skeleton for the view.
  // The day-grid component will render inside of a container defined by this HTML.
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
            '<td class="' + theme.getClass('widgetContent') + '"></td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
  }


  // Generates an HTML attribute string for setting the width of the week number column, if it is known
  weekNumberStyleAttr() {
    if (this.weekNumberWidth != null) {
      return 'style="width:' + this.weekNumberWidth + 'px"'
    }
    return ''
  }


  // Determines whether each row should have a constant height
  hasRigidRows() {
    let eventLimit = this.opt('eventLimit')

    return eventLimit && typeof eventLimit !== 'number'
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  updateSize(isResize: boolean, viewHeight: number, isAuto: boolean) {
    super.updateSize(isResize, viewHeight, isAuto) // will call updateBaseSize. important that executes first

    this.dayGrid.updateSize(isResize)
  }


  // Refreshes the horizontal dimensions of the view
  updateBaseSize(isResize: boolean, viewHeight: number, isAuto: boolean) {
    let { dayGrid } = this
    let eventLimit = this.opt('eventLimit')
    let headRowEl = (this as any).header ? (this as any).header.el : null // HACK
    let scrollerHeight
    let scrollbarWidths

    // hack to give the view some height prior to dayGrid's columns being rendered
    // TODO: separate setting height from scroller VS dayGrid.
    if (!dayGrid.rowEls) {
      if (!isAuto) {
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        this.scroller.setHeight(scrollerHeight)
      }
      return
    }

    if (this.colWeekNumbersVisible) {
      // Make sure all week number cells running down the side have the same width.
      this.weekNumberWidth = matchCellWidths(
        findElements(this.el, '.fc-week-number')
      )
    }

    // reset all heights to be natural
    this.scroller.clear()
    if (headRowEl) {
      uncompensateScroll(headRowEl)
    }

    dayGrid.removeSegPopover() // kill the "more" popover if displayed

    // is the event limit a constant level number?
    if (eventLimit && typeof eventLimit === 'number') {
      dayGrid.limitRows(eventLimit) // limit the levels first so the height can redistribute after
    }

    // distribute the height to the rows
    // (viewHeight is a "recommended" value if isAuto)
    scrollerHeight = this.computeScrollerHeight(viewHeight)
    this.setGridHeight(scrollerHeight, isAuto)

    // is the event limit dynamically calculated?
    if (eventLimit && typeof eventLimit !== 'number') {
      dayGrid.limitRows(eventLimit) // limit the levels after the grid's row heights have been set
    }

    if (!isAuto) { // should we force dimensions of the scroll container?

      this.scroller.setHeight(scrollerHeight)
      scrollbarWidths = this.scroller.getScrollbarWidths()

      if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?

        if (headRowEl) {
          compensateScroll(headRowEl, scrollbarWidths)
        }

        // doing the scrollbar compensation might have created text overflow which created more height. redo
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        this.scroller.setHeight(scrollerHeight)
      }

      // guarantees the same scrollbar widths
      this.scroller.lockOverflow(scrollbarWidths)
    }
  }


  // given a desired total height of the view, returns what the height of the scroller should be
  computeScrollerHeight(viewHeight) {
    return viewHeight -
      subtractInnerElHeight(this.el, this.scroller.el) // everything that's NOT the scroller
  }


  // Sets the height of just the DayGrid component in this view
  setGridHeight(height, isAuto) {

    if (this.opt('monthMode')) {

      // if auto, make the height of each row the height that it would be if there were 6 weeks
      if (isAuto) {
        height *= this.dayGrid.rowCnt / 6
      }

      distributeHeight(this.dayGrid.rowEls, height, !isAuto) // if auto, don't compensate for height-hogging rows

    } else {

      if (isAuto) {
        undistributeHeight(this.dayGrid.rowEls) // let the rows be their natural height with no expanding
      } else {
        distributeHeight(this.dayGrid.rowEls, height, true) // true = compensate for height-hogging rows
      }
    }
  }


  /* Scroll
  ------------------------------------------------------------------------------------------------------------------*/


  computeDateScroll(duration: Duration) {
    return { top: 0 }
  }


  queryDateScroll() {
    return { top: this.scroller.getScrollTop() }
  }


  applyDateScroll(scroll) {
    if (scroll.top !== undefined) {
      this.scroller.setScrollTop(scroll.top)
    }
  }


  /* Header Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntroHtml = () => {
    let { theme } = this

    if (this.colWeekNumbersVisible) {
      return '' +
        '<th class="fc-week-number ' + theme.getClass('widgetHeader') + '" ' + this.weekNumberStyleAttr() + '>' +
          '<span>' + // needed for matchCellWidths
            htmlEscape(this.opt('weekLabel')) +
          '</span>' +
        '</th>'
    }

    return ''
  }


  /* Day Grid Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before content-skeleton cells that display the day/week numbers
  renderDayGridNumberIntroHtml = (row: number, dayGrid: DayGrid) => {
    let { dateEnv } = this
    let weekStart = dayGrid.props.cells[row][0].date

    if (this.colWeekNumbersVisible) {
      return '' +
        '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + '>' +
          buildGotoAnchorHtml( // aside from link, important for matchCellWidths
            this,
            { date: weekStart, type: 'week', forceOff: dayGrid.colCnt === 1 },
            dateEnv.format(weekStart, WEEK_NUM_FORMAT) // inner HTML
          ) +
        '</td>'
    }

    return ''
  }


  // Generates the HTML that goes before the day bg cells for each day-row
  renderDayGridBgIntroHtml = () => {
    let { theme } = this

    if (this.colWeekNumbersVisible) {
      return '<td class="fc-week-number ' + theme.getClass('widgetContent') + '" ' + this.weekNumberStyleAttr() + '></td>'
    }

    return ''
  }


  // Generates the HTML that goes before every other type of row generated by DayGrid.
  // Affects mirror-skeleton and highlight-skeleton rows.
  renderDayGridIntroHtml = () => {

    if (this.colWeekNumbersVisible) {
      return '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + '></td>'
    }

    return ''
  }

}

DayGridView.prototype.dateProfileGeneratorClass = DayGridDateProfileGenerator
