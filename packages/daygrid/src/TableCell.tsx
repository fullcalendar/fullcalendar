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
  setRef,
  MountHook,
  ClassNamesHook,
  InnerContentHook,
  getDayClassNames,
  DateProfile,
  DateRange,
  getDayMeta
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
    let dateStr = dateEnv.formatIso(date, { omitTime: true })
    let zonedDate = dateEnv.toDate(date)
    let dayMeta = getDayMeta(date, props.todayRange, props.dateProfile)
    let staticProps = {
      date: zonedDate,
      view: context.view
    }
    let dynamicProps = {
      ...staticProps,
      ...dayMeta,
      hasEvents: props.hasEvents
    }

    let standardClassNames = [ 'fc-daygrid-day' ].concat(
      getDayClassNames(dayMeta, context.theme)
    )

    return (
      <MountHook
        name='dateCell'
        handlerProps={staticProps}
        content={(rootElRef: Ref<HTMLTableCellElement>) => (
          <ClassNamesHook
            name='dateCell'
            handlerProps={dynamicProps}
            content={(customClassNames) => (
              <td
                class={standardClassNames.concat(customClassNames).join(' ')}
                {...props.htmlAttrs}
                data-date={dateStr}
                ref={(el: HTMLTableCellElement | null) => {
                  setRef(props.elRef, el)
                  setRef(rootElRef, el)
                }}
              >
                <div class='fc-daygrid-day-inner' ref={props.innerElRef /* different from hook system! */}>
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
                  <InnerContentHook
                    name='dateCell'
                    innerProps={dynamicProps}
                    outerContent={(innerContentParentRef, innerContent, anySpecified) => (
                      anySpecified && (
                        <div class='fc-daygrid-day-misc' ref={innerContentParentRef}>{innerContent}</div>
                      )
                    )}
                  />
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
          />
        )}
      />
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
