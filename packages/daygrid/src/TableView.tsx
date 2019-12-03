import {
  findElements,
  matchCellWidths,
  uncompensateScroll,
  compensateScroll,
  subtractInnerElHeight,
  distributeHeight,
  undistributeHeight,
  createFormatter,
  Scroller,
  View,
  memoize,
  getViewClassNames,
  GotoAnchor
} from '@fullcalendar/core'
import Table from './Table'
import TableDateProfileGenerator from './TableDateProfileGenerator'
import { VNode, h, createRef, ComponentChildren } from 'preact'

const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


/* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a Table subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.


export default abstract class TableView extends View {

  protected processOptions = memoize(this._processOptions)
  private rootElRef = createRef<HTMLDivElement>()
  private scrollerRef = createRef<Scroller>()
  private colWeekNumbersVisible: boolean // computed option
  private weekNumberWidth: number

  getRootEl() { return this.rootElRef.current }


  renderLayout(headerContent: ComponentChildren, bodyContent: ComponentChildren) {
    let { theme, options } = this.context
    let classNames = getViewClassNames(this.props.viewSpec).concat('fc-dayGrid-view')

    this.processOptions(options)

    return (
      <div ref={this.rootElRef} class={classNames.join(' ')}>
        <table class={theme.getClass('tableGrid')}>
          {options.columnHeader &&
            <thead class='fc-head'>
              <tr>
                <td class={'fc-head-container ' + theme.getClass('widgetHeader')}>
                  {headerContent}
                </td>
              </tr>
            </thead>
          }
          <tbody class='fc-body'>
            <tr>
              <td class={theme.getClass('widgetContent')}>
                <Scroller ref={this.scrollerRef} overflowX='hidden' overflowY='auto' extraClassName='fc-day-grid-container'>
                  {bodyContent}
                </Scroller>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }


  private _processOptions(options) {
    let cellWeekNumbersVisible: boolean
    let colWeekNumbersVisible: boolean

    if (options.weekNumbers) {
      if (options.weekNumbersWithinDays) {
        cellWeekNumbersVisible = true
        colWeekNumbersVisible = false
      } else {
        cellWeekNumbersVisible = false
        colWeekNumbersVisible = true
      }
    } else {
      colWeekNumbersVisible = false
      cellWeekNumbersVisible = false
    }

    this.colWeekNumbersVisible = colWeekNumbersVisible

    return { cellWeekNumbersVisible, colWeekNumbersVisible }
  }


  // Generates an HTML attribute string for setting the width of the week number column, if it is known
  weekNumberStyles() {
    if (this.weekNumberWidth != null) {
      return { width: this.weekNumberWidth }
    }
    return {}
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  // Refreshes the horizontal dimensions of the view
  // TODO: dont pass in optinos
  updateLayoutHeight(headRowEl: HTMLElement | null, table: Table, viewHeight: number, isAuto: boolean) {
    let rootEl = this.rootElRef.current
    let scroller = this.scrollerRef.current
    let { options } = this.context
    let eventLimit = options.eventLimit
    let scrollerHeight
    let scrollbarWidths

    // hack to give the view some height prior to dayGrid's columns being rendered
    // TODO: separate setting height from scroller VS dayGrid.
    if (!table.rowEls) {
      if (!isAuto) {
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        scroller.setHeight(scrollerHeight)
      }
      return
    }

    if (this.colWeekNumbersVisible) {
      // Make sure all week number cells running down the side have the same width.
      this.weekNumberWidth = matchCellWidths(
        findElements(rootEl, '.fc-week-number')
      )
    }

    // reset all heights to be natural
    scroller.clear()
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

      scroller.setHeight(scrollerHeight)
      scrollbarWidths = scroller.getScrollbarWidths()

      if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?

        if (headRowEl) {
          compensateScroll(headRowEl, scrollbarWidths)
        }

        // doing the scrollbar compensation might have created text overflow which created more height. redo
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        scroller.setHeight(scrollerHeight)
      }

      // guarantees the same scrollbar widths
      scroller.lockOverflow(scrollbarWidths)
    }
  }


  // given a desired total height of the view, returns what the height of the scroller should be
  computeScrollerHeight(viewHeight) {
    let rootEl = this.rootElRef.current
    let scroller = this.scrollerRef.current

    return viewHeight - subtractInnerElHeight(rootEl, scroller.rootEl) // everything that's NOT the scroller
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


  /* Header Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntro = (): VNode[] => {
    let { theme, options } = this.context

    if (this.colWeekNumbersVisible) {
      // inner span needed for matchCellWidths
      return [
        <th class={'fc-week-number ' + theme.getClass('widgetHeader')} style={this.weekNumberStyles()}>
          <span>
            {options.weekLabel}
          </span>
        </th>
      ]
    }

    return []
  }


  /* Table Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before content-skeleton cells that display the day/week numbers
  renderNumberIntro = (row: number, cells: any): VNode[] => {
    let { options, dateEnv } = this.context
    let weekStart = cells[row][0].date
    let colCnt = cells[0].length

    if (this.colWeekNumbersVisible) {

      // aside from link, the GotoAnchor is important for matchCellWidths
      return [
        <td class='fc-week-number' style={this.weekNumberStyles()}>
          <GotoAnchor
            navLinks={options.navLinks}
            gotoOptions={{ date: weekStart, type: 'week', forceOff: colCnt === 1 }}
          >{dateEnv.format(weekStart, WEEK_NUM_FORMAT)}</GotoAnchor>
        </td>
      ]
    }

    return []
  }


  // Generates the HTML that goes before the day bg cells for each day-row
  renderBgIntro = (): VNode[] => {
    let { theme } = this.context

    if (this.colWeekNumbersVisible) {
      return [
        <td class={'fc-week-number ' + theme.getClass('widgetContent')} style={this.weekNumberStyles()}></td>
      ]
    }

    return []
  }


  // Generates the HTML that goes before every other type of row generated by Table.
  // Affects mirror-skeleton and highlight-skeleton rows.
  renderIntro = (): VNode[] => {

    if (this.colWeekNumbersVisible) {
      return [
        <td class='fc-week-number' style={this.weekNumberStyles()}></td>
      ]
    }

    return []
  }

}

TableView.prototype.dateProfileGeneratorClass = TableDateProfileGenerator


// Determines whether each row should have a constant height
export function hasRigidRows(options) {
  let eventLimit = options.eventLimit

  return eventLimit && typeof eventLimit !== 'number'
}
