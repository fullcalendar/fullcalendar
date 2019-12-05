import {
  VNode, h,
  DateProfile,
  DateMarker,
  BaseComponent,
  rangeContainsMarker,
  getDayClasses,
  createFormatter,
  findElements,
  GotoAnchor,
  guid
} from '@fullcalendar/core'
import DayBgRow from './DayBgRow'


export interface TableSkeletonProps {
  handleDom?: (rootEl: HTMLElement | null, rowEls: HTMLElement[] | null, cellEls: HTMLElement[] | null) => void
  dateProfile: DateProfile
  cells: CellModel[][]
  isRigid: boolean
    // isRigid determines whether the individual rows should ignore the contents and be a constant height.
    // Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
  renderNumberIntro: (row: number, cells: any) => VNode[]
  renderBgIntro: () => VNode[]
  renderIntro: () => VNode[]
  colWeekNumbersVisible: boolean // week numbers render in own column? (caller does HTML via intro)
  cellWeekNumbersVisible: boolean // display week numbers in day cell?
}

export interface CellModel {
  date: DateMarker
  htmlAttrs?: object
}

const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })
const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


export default class TableSkeleton extends BaseComponent<TableSkeletonProps> {


  render() {
    let rowCnt = this.props.cells.length
    let rowNodes: VNode[] = []

    for (let row = 0; row < rowCnt; row++) {
      rowNodes.push(
        this.renderDayRow(row)
      )
    }

    return ( // guid rerenders whole DOM every time
      <div class='fc-day-grid' ref={this.handleRootEl} key={guid()}>
        {rowNodes}
      </div>
    )
  }


  // Generates the HTML for a single row, which is a div that wraps a table.
  // `row` is the row number.
  renderDayRow(row) {
    let { theme } = this.context
    let { props } = this
    let classes = [ 'fc-row', 'fc-week', theme.getClass('dayRow') ]

    if (props.isRigid) {
      classes.push('fc-rigid')
    }

    return (
      <div class={classes.join(' ')}>
        <div class='fc-bg'>
          <table class={theme.getClass('tableGrid')}>
            <DayBgRow
              cells={props.cells[row]}
              dateProfile={props.dateProfile}
              renderIntro={props.renderBgIntro}
            />
          </table>
        </div>
        <div class="fc-content-skeleton">
          <table>
            {this.getIsNumbersVisible() &&
              <thead>
                {this.renderNumberTr(row)}
              </thead>
            }
          </table>
        </div>
      </div>
    )
  }


  getIsNumbersVisible() {
    let { props } = this

    return this.getIsDayNumbersVisible(props.cells.length) ||
      props.cellWeekNumbersVisible ||
      props.colWeekNumbersVisible
  }


  getIsDayNumbersVisible(rowCnt) {
    return rowCnt > 1
  }


  renderNumberTr(row: number) {
    let { props, context } = this
    let intro = props.renderNumberIntro(row, props.cells)

    return (
      <tr>
        {!context.isRtl && intro}
        {this.renderNumberCells(row)}
        {context.isRtl && intro}
      </tr>
    )
  }


  renderNumberCells(row) {
    let { cells } = this.props
    let colCnt = cells[row].length
    let parts: VNode[] = []
    let col
    let date

    for (col = 0; col < colCnt; col++) {
      date = cells[row][col].date

      parts.push(
        this.renderNumberCell(date)
      )
    }

    if (this.context.isRtl) {
      parts.reverse()
    }

    return parts
  }


  // Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
  // The number row will only exist if either day numbers or week numbers are turned on.
  renderNumberCell(date) {
    let { props, context } = this
    let { dateEnv, options } = context
    let { dateProfile } = props
    let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
    let isDayNumberVisible = this.getIsDayNumbersVisible(props.cells.length) && isDateValid
    let weekCalcFirstDow

    if (!isDayNumberVisible && !props.cellWeekNumbersVisible) {
      // no numbers in day cell (week number must be along the side)
      return (<td></td>) //  will create an empty space above events :(
    }

    let classNames = getDayClasses(date, dateProfile, context)
    classNames.unshift('fc-day-top')

    let attrs = {} as any
    if (isDateValid) {
      attrs['data-date'] = dateEnv.formatIso(date, { omitTime: true })
    }

    if (props.cellWeekNumbersVisible) {
      weekCalcFirstDow = dateEnv.weekDow
    }

    return (
      <td class={classNames.join(' ')} {...attrs}>
        {(props.cellWeekNumbersVisible && (date.getUTCDay() === weekCalcFirstDow)) &&
          <GotoAnchor
            navLinks={options.navLinks}
            gotoOptions={{ date, type: 'week' }}
            extraAttrs={{ 'class': 'fc-week-number' }}
          >{dateEnv.format(date, WEEK_NUM_FORMAT)}</GotoAnchor>
        }
        {isDayNumberVisible &&
          <GotoAnchor
            navLinks={options.navLinks}
            gotoOptions={date}
            extraAttrs={{ 'class': 'fc-day-number' }}
          >{dateEnv.format(date, DAY_NUM_FORMAT)}</GotoAnchor>
        }
      </td>
    )
  }


  handleRootEl = (rootEl: HTMLElement | null) => {
    let { calendar, view, dateEnv, isRtl } = this.context
    let { cells, handleDom } = this.props
    let rowEls = null
    let cellEls = null

    if (rootEl) {
      let rowCnt = cells.length
      let colCnt = cells[0].length

      rowEls = findElements(rootEl, '.fc-row')

      cellEls = []
      for (let rowEl of rowEls) {
        let rowCellEls = findElements(rowEl, '.fc-day, .fc-disabled-day')
        if (isRtl) {
          rowCellEls.reverse()
        }
        cellEls.push(...rowCellEls)
      }

      // trigger dayRender with each cell's element
      for (let row = 0; row < rowCnt; row++) {
        for (let col = 0; col < colCnt; col++) {
          calendar.publiclyTrigger('dayRender', [
            {
              date: dateEnv.toDate(cells[row][col].date),
              el: cellEls[row * colCnt + col],
              view
            }
          ])
        }
      }
    }

    if (handleDom) {
      handleDom(rootEl, rowEls, cellEls)
    }
  }

}
