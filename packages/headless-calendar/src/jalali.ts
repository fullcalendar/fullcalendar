import { DateMarker } from './marker'

/*
Conversion between the Gregorian calendar and the Jalali calendar, also called the Persian
or Solar Hijri calendar.

A Jalali year begins on the day of the March equinox. Its first six months have 31 days,
the next five have 30, and the last one (Esfand) has 29, or 30 in a leap year. Leap years
follow an arithmetic 33-year cycle, which is the same rule the browser uses for its
`persian` Intl calendar, so the dates computed here always agree with the ones Intl prints.
The two rules give the same answer for Jalali years 801 through 1501 (Gregorian 1422
through 2122), which covers every year a calendar realistically displays.

Both directions go through a "day number", the count of whole days since the Unix epoch.
That is also what the UTC fields of a DateMarker measure, so the two sides line up easily.
*/

const MS_PER_DAY = 1000 * 60 * 60 * 24

// day number of 1 Farvardin 1, the first day of the Jalali calendar
const JALALI_EPOCH_DAY = -492268

// how far into the year each Jalali month begins, in days
const MONTH_START_DAYS = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336]

export interface JalaliDate {
  year: number
  month: number // zero-based, like a Gregorian month
  day: number
}

// The Jalali date the marker falls on. The marker's time-of-day is ignored.
export function markerToJalaliDate(marker: DateMarker): JalaliDate {
  return dayNumToJalaliDate(Math.floor(marker.valueOf() / MS_PER_DAY))
}

/*
Midnight of the given Jalali date, as a marker.

`month` and `day` are allowed to fall outside their usual range, in which case they roll
over into the neighboring months and years. DateEnv depends on that, because it does its
date math by offsetting these numbers before handing them back.
*/
export function jalaliDateToMarker(year: number, month: number, day: number): DateMarker {
  const wholeYears = Math.floor(month / 12)
  const dayNum = jalaliDateToDayNum(
    year + wholeYears,
    month - wholeYears * 12,
    day,
  )

  return new Date(dayNum * MS_PER_DAY)
}

function jalaliDateToDayNum(year: number, month: number, day: number): number {
  return JALALI_EPOCH_DAY +
    daysBeforeJalaliYear(year) +
    MONTH_START_DAYS[month] +
    (day - 1)
}

function dayNumToJalaliDate(dayNum: number): JalaliDate {
  const daysSinceEpoch = dayNum - JALALI_EPOCH_DAY

  // no Jalali year is longer than 366 days, so this guess is never too high.
  // the loop corrects it, which takes only a few steps
  let year = Math.floor(daysSinceEpoch / 366) + 1
  while (daysBeforeJalaliYear(year + 1) <= daysSinceEpoch) {
    year += 1
  }

  const dayOfYear = daysSinceEpoch - daysBeforeJalaliYear(year)

  let month = MONTH_START_DAYS.length - 1
  while (MONTH_START_DAYS[month] > dayOfYear) {
    month -= 1
  }

  return {
    year,
    month,
    day: dayOfYear - MONTH_START_DAYS[month] + 1,
  }
}

/*
Days from the start of the Jalali calendar to the start of the given year. The second term
counts the leap days that came before, 8 in every 33-year cycle.
*/
function daysBeforeJalaliYear(year: number): number {
  return 365 * (year - 1) + Math.floor((8 * year + 21) / 33)
}
