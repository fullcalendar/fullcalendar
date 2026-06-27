import { DateProfile } from '../DateProfileGenerator'
import { diffWholeDays, DateRange, DateEnv, joinDateTimeFormatParts, DateTimeRangeFormatPartWithWeek } from '@full-ui/headless-calendar'
import { createFormatter, FormatterInput } from '../datelib/formatting'
import { ViewOptionsRefined } from '../options'

// Computes what the title at the top of the calendarApi should be for this view
export function buildTitle(
  dateProfile: DateProfile,
  viewOptions: ViewOptionsRefined,
  dateEnv: DateEnv,
): string {
  let range: DateRange

  // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
  if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
    range = dateProfile.currentRange
  } else { // for day units or smaller, use the actual day range
    range = dateProfile.activeRange
  }

  let parts: DateTimeRangeFormatPartWithWeek[]
  const options = { isEndExclusive: dateProfile.isRangeAllDay }

  if (viewOptions.titleFormat) {
    parts = dateEnv.formatRangeToParts(
      range.start,
      range.end,
      createFormatter(viewOptions.titleFormat),
      options,
    )
  } else {
    parts = dateEnv.formatRangeToParts(
      range.start,
      range.end,
      createFormatter(buildTitleFormat(dateProfile, viewOptions.disallowAmbigTitle, 'long')),
      options,
    )

    if (hasTwoMonths(parts)) {
      parts = dateEnv.formatRangeToParts(
        range.start,
        range.end,
        createFormatter(buildTitleFormat(dateProfile, viewOptions.disallowAmbigTitle, 'short')),
        options,
      )
    }
  }

  return joinDateTimeFormatParts(parts)
}

// Generates the format string that should be used to generate the title for the current date range.
// Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
function buildTitleFormat(
  dateProfile: DateProfile,
  disallowAmbigTitle: boolean,
  monthFormat: 'long' | 'short'
): FormatterInput {
  const { currentRangeUnit } = dateProfile

  if (currentRangeUnit === 'year') {
    return { year: 'numeric' }
  }

  if (currentRangeUnit === 'month') {
    return { year: 'numeric', month: monthFormat }
  }

  if (!disallowAmbigTitle) {
    const days = diffWholeDays(
      dateProfile.currentRange.start,
      dateProfile.currentRange.end,
    )

    if (days !== null && days > 1) {
      return {
        year: 'numeric',
        month: monthFormat,
      }
    }
  }

  // one day. longer, like "September 9 2014"
  return { year: 'numeric', month: 'long', day: 'numeric' }
}

function hasTwoMonths(parts: DateTimeRangeFormatPartWithWeek[]): boolean {
  let hasStartMonth = false
  let hasEndMonth = false
  for (const part of parts) {
    if (part.type === 'month') {
      if (part.source === 'startRange') hasStartMonth = true
      if (part.source === 'endRange') hasEndMonth = true
    }
  }
  return hasStartMonth && hasEndMonth
}
