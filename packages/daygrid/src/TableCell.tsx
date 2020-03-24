import {
  Ref,
  ComponentChildren,
  h,
  DateMarker,
  DateComponent,
  ComponentContext,
  CssDimValue,
  DateProfile,
  DateRange,
  DayCellRoot,
  buildNavLinkData,
  DayCellDynamicProps,
  RenderHook,
  WeekNumberRoot,
} from '@fullcalendar/core'


export interface TableCellProps extends TableCellModel {
  elRef?: Ref<HTMLTableCellElement>
  innerElRef?: Ref<HTMLDivElement>
  bgContent: ComponentChildren
  fgContentElRef?: Ref<HTMLDivElement>
  fgContent: ComponentChildren
  fgPaddingBottom: CssDimValue
  hasEvents: boolean // TODO: do something with this
  moreCnt: number
  moreMarginTop: number
  showDayNumber: boolean
  showWeekNumber: boolean
  dateProfile: DateProfile
  todayRange: DateRange
  buildMoreLinkText: (num: number) => string
  onMoreClick?: (arg: MoreLinkArg) => void
}

export interface TableCellModel { // combine with DayTableCell?
  date: DateMarker
  extraMountProps?: object
  extraDataAttrs?: object
  extraClassNames?: string[]
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
}

const DEFAULT_WEEK_NUM_FORMAT = { week: 'narrow' }


export default class TableCell extends DateComponent<TableCellProps> {


  render(props: TableCellProps, state: {}, context: ComponentContext) {
    let { options } = context
    let { date } = props

    return (
      <DayCellRoot
        date={date}
        todayRange={props.todayRange}
        dateProfile={props.dateProfile}
        showDayNumber={props.showDayNumber}
        extraMountProps={props.extraMountProps}
        elRef={props.elRef}
        defaultInnerContent={renderCellHeaderInner}
      >
        {(rootElRef, classNames, rootDataAttrs, innerElRef, innerContent) => (
          <td
            ref={rootElRef}
            class={[ 'fc-daygrid-day' ].concat(classNames, props.extraClassNames || []).join(' ')}
            {...rootDataAttrs}
            {...props.extraDataAttrs}
          >
            <div class='fc-daygrid-day-frame fc-scrollgrid-sync-inner' ref={props.innerElRef /* different from hook system! RENAME */}>
              {props.showWeekNumber &&
                <WeekNumberRoot date={date} defaultFormat={DEFAULT_WEEK_NUM_FORMAT}>
                  {(rootElRef, classNames, innerElRef, innerContent) => (
                    <div class={[ 'fc-daygrid-week-number' ].concat(classNames).join(' ')} ref={rootElRef}>
                      <a ref={innerElRef}
                        data-navlink={options.navLinks ? buildNavLinkData(date, 'week') : null}
                      >
                        {innerContent}
                      </a>
                    </div>
                  )}
                </WeekNumberRoot>
              }
              {innerContent &&
                <div class='fc-daygrid-day-top' ref={innerElRef}>
                  {innerContent}
                </div>
              }
              <div
                class='fc-daygrid-day-events'
                ref={props.fgContentElRef}
                style={{ paddingBottom: props.fgPaddingBottom }}
              >
                {props.fgContent}
                {Boolean(props.moreCnt) &&
                  <div class='fc-daygrid-day-bottom' style={{ marginTop: props.moreMarginTop }}>
                    <RenderHook name='moreLink'
                      mountProps={{ view: context.view }}
                      dynamicProps={{ num: props.moreCnt, text: props.buildMoreLinkText(props.moreCnt), view: context.view }}
                      defaultInnerContent={renderMoreLinkInner}
                    >
                      {(rootElRef, classNames, innerElRef, innerContent) => (
                        <a onClick={this.handleMoreLink} ref={rootElRef} className={[ 'fc-daygrid-more-link' ].concat(classNames).join(' ')}>
                          {innerContent}
                        </a>
                      )}
                    </RenderHook>
                  </div>
                }
              </div>
              <div class='fc-daygrid-day-bg'>
                {props.bgContent}
              </div>
            </div>
          </td>
        )}
      </DayCellRoot>
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


function renderCellHeaderInner(props: DayCellDynamicProps) {
  if (props.dayNumberText) {
    return (
      <a className='fc-daygrid-day-number' data-navlink={props.navLinkData}>
        {props.dayNumberText}
      </a>
    )
  }
}


function renderMoreLinkInner(props) {
  return props.text
}
