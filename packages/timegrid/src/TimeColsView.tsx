import {
  h, createRef,
  View,
  createFormatter, diffDays,
  Duration,
  getViewClassNames,
  GotoAnchor,
  ViewProps,
  SimpleScrollGridSection,
  VNode,
  SimpleScrollGrid,
  ChunkContentCallbackArgs
} from '@fullcalendar/core'
import { Table } from '@fullcalendar/daygrid'
import { TimeCols } from './main'
import AllDaySplitter from './AllDaySplitter'


const WEEK_HEADER_FORMAT = createFormatter({ week: 'short' })
const AUTO_ALL_DAY_EVENT_LIMIT = 5


/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeCols subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default abstract class TimeColsView extends View {

  protected allDaySplitter = new AllDaySplitter() // for use by subclasses

  private rootElRef = createRef<HTMLDivElement>()
  private dividerElRef = createRef<HTMLTableCellElement>()
  private scrollerElRef = createRef<HTMLDivElement>()
  private axisWidth: any // the width of the time axis running down the side


  // abstract requirements
  // ----------------------------------------------------------------------------------------------------

  abstract getAllDayTableObj(): { table: Table } | null
  abstract getTimeColsObj(): { timeCols: TimeCols }


  // rendering
  // ----------------------------------------------------------------------------------------------------


  renderLayout(
    headerRowContent: VNode | null,
    allDayContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    timeContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null
  ) {
    let { props } = this
    let { theme } = this.context
    let classNames = getViewClassNames(props.viewSpec).concat('fc-timeGrid-view')
    let sections: SimpleScrollGridSection[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
        chunk: {
          rowContent: headerRowContent
        }
      })
    }

    if (allDayContent) {
      sections.push({
        type: 'body',
        chunk: {
          content: allDayContent
        }
      })
      sections.push({
        outerContent: (
          <tr>
            <td class={'fc-divider ' + theme.getClass('tableCellHeader')} ref={this.dividerElRef} colSpan={0} />
          </tr>
        )
      })
    }

    sections.push({
      type: 'body',
      vGrow: true,
      chunk: {
        scrollerElRef: this.scrollerElRef,
        content: timeContent
      }
    })

    return (
      <div class={classNames.join(' ')} ref={this.rootElRef}>
        <SimpleScrollGrid
          forPrint={props.forPrint}
          vGrow={!props.isHeightAuto}
          cols={[ { width: 'shrink' } ]}
          sections={sections}
        />
      </div>
    )
  }


  componentDidMount() {
    let allDayTable = this.getAllDayTableObj()
    let dividerEl = this.dividerElRef.current

    if (allDayTable) {
      allDayTable.table.bottomCoordPadding = dividerEl.getBoundingClientRect().height
    }

    this.scrollToInitialTime()
  }


  componentDidUpdate(prevProps: ViewProps) {
    if (prevProps.dateProfile !== this.props.dateProfile) {
      this.scrollToInitialTime()
    }
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  getAllDayEventLimit() {
    let eventLimit = this.context.options.eventLimit
    if (eventLimit && typeof eventLimit !== 'number') {
      eventLimit = AUTO_ALL_DAY_EVENT_LIMIT // make sure "auto" goes to a real number
    }
    return eventLimit
  }


  /* Scroll
  ------------------------------------------------------------------------------------------------------------------*/


  scrollToTime(duration: Duration) {
    let scrollTop = this.computeDateScroll(duration)
    let scrollerEl = this.scrollerElRef.current

    scrollerEl.scrollTop = scrollTop
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
        <th class={'fc-axis shrink fc-week-number' + theme.getClass('tableCellHeader')} style={this.getAxisStyles()}>
          <div data-fc-width-all={1}>
            <GotoAnchor
              navLinks={options.navLinks}
              gotoOptions={{ date: range.start, type: 'week', forceOff: dayCnt > 1 }}
              extraAttrs={{ 'data-fc-width-content': 1 }}
            >{weekText}</GotoAnchor>
          </div>
        </th>
      ]
    }

    return [
      <th class={'fc-axis' + theme.getClass('tableCellHeader')} style={this.getAxisStyles()}></th>
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
      <td class={'fc-axis' + theme.getClass('tableCellNormal')} style={this.getAxisStyles()}></td>
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
      <td class={'shrink fc-axis' + theme.getClass('tableCellNormal')} style={this.getAxisStyles()}>
        <div data-fc-width-all={1}>
          <span {...spanAttrs} data-fc-width-content={1}>
            {child}
          </span>
        </div>
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
