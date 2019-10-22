import {
  htmlEscape, findElements,
  matchCellWidths,
  uncompensateScroll,
  compensateScroll,
  subtractInnerElHeight,
  distributeHeight,
  undistributeHeight,
  createFormatter,
  Scroller,
  View,
  buildGotoAnchorHtml,
  Duration,
  ComponentContext,
  memoize,
  renderer,
  renderViewEl
} from '@fullcalendar/core'
import Table, { TableRenderProps } from './Table'
import TableDateProfileGenerator from './TableDateProfileGenerator'

const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


/* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a Table subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.

export default abstract class TableView extends View {

  private processOptions = memoize(this._processOptions)
  private renderSkeleton = renderer(this._renderSkeleton)
  private renderScroller = renderer(Scroller)

  private scroller: Scroller

  // computed options
  private colWeekNumbersVisible: boolean
  private cellWeekNumbersVisible: boolean
  private weekNumberWidth: number


  renderLayout(options: { type: string }, context: ComponentContext) {
    this.processOptions(context.options)

    let res = this.renderSkeleton(true, options)

    let scroller = this.renderScroller(res.contentWrapEl, {
      overflowX: 'hidden',
      overflowY: 'auto'
    })

    let tableWrapEl = scroller.rootEl
    tableWrapEl.classList.add('fc-day-grid-container') // TODO: avoid every time

    this.scroller = scroller

    return res
  }


  _renderSkeleton({ type }: { type: string }, context: ComponentContext) {
    let { theme, options } = context

    let el = renderViewEl(type)
    el.classList.add('fc-dayGrid-view')
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
            '<td class="' + theme.getClass('widgetContent') + '"></td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'

    return {
      rootEl: el,
      headerWrapEl: options.columnHeader ? (el.querySelector('.fc-head-container') as HTMLElement) : null,
      contentWrapEl: el.querySelector('.fc-body > tr > td') as HTMLElement
    }
  }


  _processOptions(options) {
    if (options.weekNumbers) {
      if (options.weekNumbersWithinDays) {
        this.cellWeekNumbersVisible = true
        this.colWeekNumbersVisible = false
      } else {
        this.cellWeekNumbersVisible = false
        this.colWeekNumbersVisible = true
      }
    } else {
      this.colWeekNumbersVisible = false
      this.cellWeekNumbersVisible = false
    }
  }


  // Generates an HTML attribute string for setting the width of the week number column, if it is known
  weekNumberStyleAttr() {
    if (this.weekNumberWidth != null) {
      return 'style="width:' + this.weekNumberWidth + 'px"'
    }
    return ''
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  // Refreshes the horizontal dimensions of the view
  updateLayoutHeight(headRowEl: HTMLElement | null, table: Table, viewHeight: number, isAuto: boolean, options) {
    let eventLimit = options.eventLimit
    let scrollerHeight
    let scrollbarWidths

    // hack to give the view some height prior to dayGrid's columns being rendered
    // TODO: separate setting height from scroller VS dayGrid.
    if (!table.rowEls) {
      if (!isAuto) {
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        this.scroller.setHeight(scrollerHeight)
      }
      return
    }

    if (this.colWeekNumbersVisible) {
      // Make sure all week number cells running down the side have the same width.
      this.weekNumberWidth = matchCellWidths(
        findElements(this.rootEl, '.fc-week-number')
      )
    }

    // reset all heights to be natural
    this.scroller.clear()
    if (headRowEl) {
      uncompensateScroll(headRowEl)
    }

    // is the event limit a constant level number?
    if (eventLimit && typeof eventLimit === 'number') {
      table.limitRows(eventLimit) // limit the levels first so the height can redistribute after
    }

    // distribute the height to the rows
    // (viewHeight is a "recommended" value if isAuto)
    scrollerHeight = this.computeScrollerHeight(viewHeight)
    this.setGridHeight(table, scrollerHeight, isAuto, options)

    // is the event limit dynamically calculated?
    if (eventLimit && typeof eventLimit !== 'number') {
      table.limitRows(eventLimit) // limit the levels after the grid's row heights have been set
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
      subtractInnerElHeight(this.rootEl, this.scroller.el) // everything that's NOT the scroller
  }


  // Sets the height of just the Table component in this view
  setGridHeight(table: Table, height, isAuto, options) {
    let { rowEls } = table

    if (options.monthMode) {

      // if auto, make the height of each row the height that it would be if there were 6 weeks
      if (isAuto) {
        height *= rowEls.length / 6
      }

      distributeHeight(rowEls, height, !isAuto) // if auto, don't compensate for height-hogging rows

    } else {

      if (isAuto) {
        undistributeHeight(rowEls) // let the rows be their natural height with no expanding
      } else {
        distributeHeight(rowEls, height, true) // true = compensate for height-hogging rows
      }
    }
  }


  /* Scroll
  ------------------------------------------------------------------------------------------------------------------*/


  computeDateScroll(duration: Duration) {
    return { top: 0 }
  }


  queryDateScroll() {
    return { top: this.scroller.controller.getScrollTop() }
  }


  applyDateScroll(scroll) {
    if (scroll.top !== undefined) {
      this.scroller.controller.setScrollTop(scroll.top)
    }
  }


  /* Header Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntroHtml = () => {
    let { theme, options } = this.context

    if (this.colWeekNumbersVisible) {
      return '' +
        '<th class="fc-week-number ' + theme.getClass('widgetHeader') + '" ' + this.weekNumberStyleAttr() + '>' +
          '<span>' + // needed for matchCellWidths
            htmlEscape(options.weekLabel) +
          '</span>' +
        '</th>'
    }

    return ''
  }


  /* Table Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before content-skeleton cells that display the day/week numbers
  renderNumberIntroHtml = (row: number, table: Table) => {
    let { options, dateEnv } = this.context
    let cells = table.props.cells
    let weekStart = cells[row][0].date
    let colCnt = cells[0].length

    if (this.colWeekNumbersVisible) {
      return '' +
        '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + '>' +
          buildGotoAnchorHtml( // aside from link, important for matchCellWidths
            options,
            dateEnv,
            { date: weekStart, type: 'week', forceOff: colCnt === 1 },
            dateEnv.format(weekStart, WEEK_NUM_FORMAT) // inner HTML
          ) +
        '</td>'
    }

    return ''
  }


  // Generates the HTML that goes before the day bg cells for each day-row
  renderBgIntroHtml = () => {
    let { theme } = this.context

    if (this.colWeekNumbersVisible) {
      return '<td class="fc-week-number ' + theme.getClass('widgetContent') + '" ' + this.weekNumberStyleAttr() + '></td>'
    }

    return ''
  }


  // Generates the HTML that goes before every other type of row generated by Table.
  // Affects mirror-skeleton and highlight-skeleton rows.
  renderIntroHtml = () => {

    if (this.colWeekNumbersVisible) {
      return '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + '></td>'
    }

    return ''
  }


  tableRenderProps: TableRenderProps = {
    renderNumberIntroHtml: this.renderNumberIntroHtml,
    renderBgIntroHtml: this.renderBgIntroHtml,
    renderIntroHtml: this.renderIntroHtml,
    colWeekNumbersVisible: this.colWeekNumbersVisible,
    cellWeekNumbersVisible: this.cellWeekNumbersVisible
  }

}

TableView.prototype.dateProfileGeneratorClass = TableDateProfileGenerator


// Determines whether each row should have a constant height
export function hasRigidRows(options) {
  let eventLimit = options.eventLimit

  return eventLimit && typeof eventLimit !== 'number'
}
