import {
  h, createRef,
  View,
  createFormatter, diffDays,
  Duration,
  DateMarker,
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


/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeCols subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default abstract class TimeColsView extends View {

  protected allDaySplitter = new AllDaySplitter() // for use by subclasses

  private rootElRef = createRef<HTMLDivElement>()
  private dividerElRef = createRef<HTMLHRElement>()
  private scrollerElRef = createRef<HTMLDivElement>()
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
    headerRowContent: VNode | null,
    allDayContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    timeContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null
  ) {
    let { theme } = this.context
    let classNames = getViewClassNames(this.props.viewSpec).concat('fc-timeGrid-view')
    let sections: SimpleScrollGridSection[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
        className: 'fc-head',
        chunk: {
          scrollerClassName: 'fc-head-container', // needed for anything?
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
        outerContent: <hr class={'fc-divider ' + theme.getClass('widgetHeader')} ref={this.dividerElRef} />
      })
    }

    sections.push({
      type: 'body',
      className: 'fc-body', // should we use above?
      chunk: {
        scrollerElRef: this.scrollerElRef,
        scrollerClassName: 'fc-time-grid-container',
        content: timeContent
      }
    })

    return (
      <div class={classNames.join(' ')} ref={this.rootElRef}>
        <SimpleScrollGrid
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

    this.startNowIndicator()
    this.scrollToInitialTime()
  }


  componentDidUpdate(prevProps: ViewProps) {
    if (prevProps.dateProfile !== this.props.dateProfile) {
      this.scrollToInitialTime()
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

  // const ALL_DAY_EVENT_LIMIT = 5
  //
  // let eventLimit
  // eventLimit = this.context.options.eventLimit
  // if (eventLimit && typeof eventLimit !== 'number') {
  //   eventLimit = ALL_DAY_EVENT_LIMIT // make sure "auto" goes to a real number
  // }
  // if (eventLimit) {
  //   table.limitRows(eventLimit)
  // }


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
        <th class={'fc-axis fc-week-number fc-shrink ' + theme.getClass('widgetHeader')} style={this.getAxisStyles()}>
          <GotoAnchor
            navLinks={options.navLinks}
            gotoOptions={{ date: range.start, type: 'week', forceOff: dayCnt > 1 }}
          >{weekText}</GotoAnchor>
        </th>
      ]
    }

    return [
      <th class={'fc-axis fc-shrink ' + theme.getClass('widgetHeader')} style={this.getAxisStyles()}></th>
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
      <td class={'fc-axis fc-shrink ' + theme.getClass('widgetContent')} style={this.getAxisStyles()}></td>
    ]
  }


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderTimeColsIntro = () => {
    return [
      <td class='fc-axis fc-shrink' style={this.getAxisStyles()}></td>
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
      <td class={'fc-axis fc-shrink ' + theme.getClass('widgetContent')} style={this.getAxisStyles()}>
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
      <td class='fc-axis fc-shrink' style={this.getAxisStyles()}></td>
    ]
  }

}

TimeColsView.prototype.usesMinMaxTime = true // indicates that minTime/maxTime affects rendering
