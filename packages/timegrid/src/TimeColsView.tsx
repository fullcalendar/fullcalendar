import {
  h, createRef,
  View,
  createFormatter, diffDays,
  getViewClassNames,
  SimpleScrollGridSection,
  VNode,
  SimpleScrollGrid,
  ChunkContentCallbackArgs,
  ScrollGridSectionConfig,
  BaseComponent,
  buildNavLinkData
} from '@fullcalendar/core'
import AllDaySplitter from './AllDaySplitter'
import { TimeSlatMeta, TimeColsAxisCell } from './TimeColsSlats'


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
  private scrollerElRef = createRef<HTMLDivElement>()


  // rendering
  // ----------------------------------------------------------------------------------------------------


  renderSimpleLayout(
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


  renderHScrollLayout(
    headerRowContent: VNode | null,
    allDayContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    timeContent: ((contentArg: ChunkContentCallbackArgs) => VNode) | null,
    colCnt: number,
    columnMinWidth: number,
    slatMetas: TimeSlatMeta[]
  ) {
    let ScrollGrid = this.context.pluginHooks.scrollGridImpl

    if (!ScrollGrid) {
      throw new Error('No ScrollGrid implementation')
    }

    let { context, props } = this
    let classNames = getViewClassNames(props.viewSpec).concat('fc-timeGrid-view')
    let sections: ScrollGridSectionConfig[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
        chunks: [
          {
            rowContent: <tr>{this.renderHeadAxis()}</tr>
          },
          {
            elRef: this.headerElRef,
            rowContent: headerRowContent
          }
        ]
      })
    }

    if (allDayContent) {
      sections.push({
        key: 'all-day',
        type: 'body',
        chunks: [
          {
            rowContent: <tr>{this.renderTableRowAxis()}</tr>,
            vGrowRows: true
          },
          {
            content: allDayContent
          }
        ]
      })
      sections.push({
        outerContent: (
          <tr>
            <td
              colSpan={2}
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
      chunks: [
        {
          rowContent: <TimeBodyAxis slatMetas={slatMetas} />
        },
        {
          scrollerElRef: this.scrollerElRef,
          content: timeContent
        }
      ]
    })

    return (
      <div class={classNames.join(' ')} ref={this.rootElRef}>
        <ScrollGrid
          forPrint={props.forPrint}
          vGrow={!props.isHeightAuto}
          colGroups={[
            { width: 'shrink', cols: [ { width: 'shrink' } ] }, // TODO: allow no specify cols
            { cols: [ { span: colCnt, minWidth: columnMinWidth } ] }
          ]}
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


  renderHeadAxis = () => {
    let { dateEnv, options } = this.context
    let range = this.props.dateProfile.renderRange
    let dayCnt = diffDays(range.start, range.end)
    let navLinkData = (options.navLinks && dayCnt === 1) // only do in day views (to avoid doing in week views that dont need it)
      ? buildNavLinkData(range.start, 'week')
      : null
    let weekText

    if (options.weekNumbers) {
      weekText = dateEnv.format(range.start, WEEK_HEADER_FORMAT)

      return (
        <th class={'fc-axis shrink fc-week-number'}>
          <div data-fc-width-all={1}>
            <a data-navlink={navLinkData} data-fc-width-content={1}>
              {weekText}
            </a>
          </div>
        </th>
      )
    }

    return (
      <th class='fc-axis'></th>
    )
  }


  /* Table Component Render Methods
  ------------------------------------------------------------------------------------------------------------------*/


  renderTableRowAxis = () => {
    let { options } = this.context
    let spanAttrs = {} as any
    let child = options.allDayText

    if (typeof options.allDayHtml === 'string') {
      spanAttrs.dangerouslySetInnerHTML = { __html: options.allDayHtml }
      child = null
    }

    return (
      <td class='shrink fc-axis'>
        <div data-fc-width-all={1}>
          <span {...spanAttrs} data-fc-width-content={1}>
            {child}
          </span>
        </div>
      </td>
    )
  }

}

TimeColsView.prototype.usesMinMaxTime = true // indicates that minTime/maxTime affects rendering


/* Thin Axis
------------------------------------------------------------------------------------------------------------------*/

interface TimeBodyAxisProps {
  slatMetas: TimeSlatMeta[]
}

class TimeBodyAxis extends BaseComponent<TimeBodyAxisProps> {

  render(props: TimeBodyAxisProps) {
    return props.slatMetas.map((slatMeta: TimeSlatMeta) => (
      <tr><TimeColsAxisCell {...slatMeta} /></tr>
    ))
  }

}
