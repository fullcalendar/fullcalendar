import {
  h,
  DateProfile,
  DateMarker,
  BaseComponent,
  rangeContainsMarker,
  getDayClasses,
  GotoAnchor,
  ComponentContext,
  Ref,
  setRef,
  createFormatter
} from '@fullcalendar/core'


export interface TableSkeletonDayCellProps {
  date: DateMarker
  dateProfile: DateProfile
  isDayNumbersVisible: boolean
  cellWeekNumbersVisible: boolean
  elRef?: Ref<HTMLTableCellElement>
}

const DAY_NUM_FORMAT = createFormatter({ day: 'numeric' })
const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


export default class TableSkeletonDayCell extends BaseComponent<TableSkeletonDayCellProps> {


  render(props: TableSkeletonDayCellProps, state: {}, context: ComponentContext) {
    let { dateEnv, options } = context
    let { date, dateProfile, cellWeekNumbersVisible } = this.props
    let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
    let isDayNumberVisible = props.isDayNumbersVisible && isDateValid
    let weekCalcFirstDow

    if (!isDayNumberVisible && !cellWeekNumbersVisible) {
      // no numbers in day cell (week number must be along the side)
      return (<td></td>) //  will create an empty space above events :(
    }

    let classNames = getDayClasses(date, dateProfile, this.context)
    classNames.unshift('fc-day-top')

    let dateStr = dateEnv.formatIso(date, { omitTime: true })
    let attrs = {} as any
    if (isDateValid) {
      attrs['data-date'] = dateStr
    }

    if (cellWeekNumbersVisible) {
      weekCalcFirstDow = dateEnv.weekDow
    }

    return (
      <td
        ref={this.handleEl}
        key={dateStr /* fresh rerender for new date, mostly because of dayRender */}
        class={classNames.join(' ')}
        {...attrs}
      >
        {(cellWeekNumbersVisible && (date.getUTCDay() === weekCalcFirstDow)) &&
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


  handleEl = (el: HTMLTableCellElement | null) => {
    let { props } = this

    if (el) {
      let { calendar, view, dateEnv } = this.context

      calendar.publiclyTrigger('dayRender', [
        {
          date: dateEnv.toDate(props.date),
          el,
          view
        }
      ])
    }

    setRef(props.elRef, el)
  }

}
