import {
  h, createRef,
  View,
  createFormatter, diffDays,
  getViewClassNames,
  GotoAnchor,
  SimpleScrollGridSection,
  VNode,
  SimpleScrollGrid,
  ChunkContentCallbackArgs
} from '@fullcalendar/core'
import AllDaySplitter from './AllDaySplitter'


const WEEK_HEADER_FORMAT = createFormatter({ week: 'short' })
const AUTO_ALL_DAY_EVENT_LIMIT = 5


/* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeCols subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default abstract class TimeColsView extends View {

  protected allDaySplitter = new AllDaySplitter() // for use by subclasses
  protected headerElRef = createRef<HTMLTableCellElement>()
  private rootElRef = createRef<HTMLDivElement>()
  private scrollerElRef = window['asdf'] = createRef<HTMLDivElement>()


  // rendering
  // ----------------------------------------------------------------------------------------------------


  renderLayout(
    headerRowContent: VNode | null,
    allDayContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    timeContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null
  ) {
    let { context, props } = this
    let classNames = getViewClassNames(props.viewSpec).concat('fc-timeGrid-view')
    let sections: SimpleScrollGridSection[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
        chunk: {
          elRef: this.headerElRef,
          rowContent: headerRowContent
        }
      })
    }

    if (allDayContent) {
      sections.push({
        key: 'all-day',
        type: 'body',
        chunk: {
          content: allDayContent
        }
      })
      sections.push({
        outerContent: (
          <tr>
            <td
              class={'fc-divider ' + context.theme.getClass('tableCellShaded')}
            />
          </tr>
        )
      })
    }

    sections.push({
      key: 'timed',
      type: 'body',
      vGrow: true,
      vGrowRows: Boolean(context.options.expandRows),
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


  handleScrollTopRequest = (scrollTop: number) => {
    this.scrollerElRef.current.scrollTop = scrollTop
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



  /* Header Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntro = () => {
    let { dateEnv, options } = this.context
    let range = this.props.dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)
    let weekText

    if (options.weekNumbers) {
      weekText = dateEnv.format(range.start, WEEK_HEADER_FORMAT)

      return [
        <th class={'fc-axis shrink fc-week-number'}>
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
      <th class='fc-axis'></th>
    ]
  }


  /* TimeCols Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that goes before the bg of the TimeCols slot area. Long vertical column.
  renderTimeColsBgIntro = () => {
    return [
      <td class='fc-axis'></td>
    ]
  }


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderTimeColsIntro = () => {
    return [
      <td class='fc-axis'></td>
    ]
  }


  /* Table Component Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that goes before the all-day cells
  renderTableBgIntro = () => {
    let { options } = this.context
    let spanAttrs = {} as any
    let child = options.allDayText

    if (typeof options.allDayHtml === 'string') {
      spanAttrs.dangerouslySetInnerHTML = { __html: options.allDayHtml }
      child = null
    }

    return [
      <td class='shrink fc-axis'>
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
      <td class='fc-axis'></td>
    ]
  }

}

TimeColsView.prototype.usesMinMaxTime = true // indicates that minTime/maxTime affects rendering
