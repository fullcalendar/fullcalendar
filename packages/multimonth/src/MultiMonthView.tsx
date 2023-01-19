import {
  DateComponent,
  ViewProps,
  ViewContainer,
  DateProfile,
  intersectRanges,
  DateMarker,
  DateEnv,
  createDuration,
  memoize,
} from '@fullcalendar/core/internal'
import { buildDayTableRenderRange } from '@fullcalendar/daygrid/internal'
import { createElement } from '@fullcalendar/core/preact'
import { SingleMonth } from './SingleMonth.js'

export class MultiMonthView extends DateComponent<ViewProps> {
  private splitDateProfileByMonth = memoize(splitDateProfileByMonth)

  render() {
    const { context, props } = this
    const { options } = context
    // const { multiMonthColumns, multiMonthColumnMinWidth } = options
    const monthDateProfiles = this.splitDateProfileByMonth(
      props.dateProfile,
      context.dateEnv,
      options.fixedWeekCount,
    )

    return (
      <ViewContainer elClasses={['fc-multimonth']} viewSpec={context.viewSpec}>
        {monthDateProfiles.map((monthDateProfile) => (
          <SingleMonth
            key={monthDateProfile.currentRange.start.toISOString()}
            {...props}
            dateProfile={monthDateProfile}
          />
        ))}
      </ViewContainer>
    )
  }
}

const oneMonthDuration = createDuration(1, 'month')

function splitDateProfileByMonth(
  dateProfile: DateProfile,
  dateEnv: DateEnv,
  fixedWeekCount?: boolean,
): DateProfile[] {
  const { start, end } = dateProfile.currentRange
  let monthStart: DateMarker = start
  const monthDateProfiles: DateProfile[] = []

  while (monthStart.valueOf() < end.valueOf()) {
    const monthEnd = dateEnv.add(monthStart, oneMonthDuration)
    const currentRange = { start: monthStart, end: monthEnd }
    const renderRange = buildDayTableRenderRange({
      currentRange,
      snapToWeek: true,
      fixedWeekCount,
      dateEnv,
    })

    monthDateProfiles.push({
      currentRange,
      currentRangeUnit: 'month',
      isRangeAllDay: true,
      validRange: intersectRanges(dateProfile.validRange, renderRange),
      activeRange: dateProfile.activeRange ? intersectRanges(dateProfile.activeRange, renderRange) : null,
      renderRange,
      slotMinTime: dateProfile.slotMaxTime,
      slotMaxTime: dateProfile.slotMinTime,
      isValid: dateProfile.isValid,
      dateIncrement: dateProfile.dateIncrement,
    })

    monthStart = monthEnd
  }

  return monthDateProfiles
}
