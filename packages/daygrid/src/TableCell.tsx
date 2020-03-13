import {
  createFormatter,
  Ref,
  ComponentChildren,
  h,
  DateMarker,
  DateComponent,
  ComponentContext,
  GotoAnchor,
  CssDimValue,
  DateProfile,
  DateRange,
  DayRoot,
} from '@fullcalendar/core'


export interface TableCellProps extends TableCellModel {
  elRef?: Ref<HTMLTableCellElement>
  innerElRef?: Ref<HTMLDivElement>
  bgContent: ComponentChildren
  fgContentElRef?: Ref<HTMLDivElement>
  fgContent: ComponentChildren
  fgPaddingBottom: CssDimValue
  hasEvents: boolean
  moreCnt: number
  moreMarginTop: number
  showDayNumber: boolean
  showWeekNumber: boolean
  dateProfile: DateProfile
  todayRange: DateRange
  onMoreClick?: (arg: MoreLinkArg) => void
}

export interface TableCellModel {
  date: DateMarker
  htmlAttrs?: object
  extraMountProps?: any
}

export interface MoreLinkArg {
  date: DateMarker
  moreCnt: number
  dayEl: HTMLElement
  ev: UIEvent
}

export interface HookProps {
  date: Date
  isPast: boolean
  isFuture: boolean
  isToday: boolean
  hasEvents: boolean
}

const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })
const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


export default class TableCell extends DateComponent<TableCellProps> {


  render(props: TableCellProps, state: {}, context: ComponentContext) {
    let { dateEnv, options } = context
    let { date } = props

    return (
      <DayRoot
        date={date}
        todayRange={props.todayRange}
        dateProfile={props.dateProfile}
        extraMountProps={props.extraMountProps}
        extraDynamicProps={{ hasEvents: props.hasEvents }}
        elRef={props.elRef}
      >
        {(rootElRef, classNames, dataAttrs, innerElRef, innerContent) => (
          <td
            ref={rootElRef}
            class={[ 'fc-daygrid-day' ].concat(classNames).join(' ')}
            {...dataAttrs}
            {...props.htmlAttrs /* TODO: rename to extraDataAttrs */}
          >
            <div class='fc-daygrid-day-inner' ref={props.innerElRef /* different from hook system! RENAME */}>
              {props.showWeekNumber &&
                <div class='fc-daygrid-week-number'>
                  <GotoAnchor
                    navLinks={options.navLinks}
                    gotoOptions={{ date, type: 'week' }}
                    extraAttrs={{
                      'data-fc-width-content': 1
                    }}
                  >{dateEnv.format(date, WEEK_NUM_FORMAT)}</GotoAnchor>
                </div>
              }
              {props.showDayNumber &&
                <div class='fc-daygrid-day-header'>
                  <GotoAnchor
                    navLinks={options.navLinks}
                    gotoOptions={date}
                    extraAttrs={{ 'class': 'fc-day-number' }}
                  >{dateEnv.format(date, DAY_NUM_FORMAT)}</GotoAnchor>
                </div>
              }
              {innerContent &&
                <div class='fc-daygrid-day-misc' ref={innerElRef}>{innerContent}</div>
              }
              <div
                class='fc-daygrid-day-events'
                ref={props.fgContentElRef}
                style={{ paddingBottom: props.fgPaddingBottom }}
              >
                {props.fgContent}
                {Boolean(props.moreCnt) &&
                  <div class='fc-more' style={{ marginTop: props.moreMarginTop }}>
                    <a onClick={this.handleMoreLink}>+{props.moreCnt} more</a>
                  </div>
                }
              </div>
              {props.bgContent}
            </div>
          </td>
        )}
      </DayRoot>
    )
  }


  handleMoreLink = (ev: UIEvent) => {
    let { props } = this
    if (props.onMoreClick) {
      props.onMoreClick({
        date: props.date,
        moreCnt: props.moreCnt,
        dayEl: this.base as HTMLElement, // TODO: bad pattern
        ev
      })
    }
  }

}
