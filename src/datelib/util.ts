
export type DateMarker = Date

export function nowMarker(): DateMarker {
  return arrayToUtcDate(dateToLocalArray(new Date()))
}


// export function markersEqual(m0: DateMarker, m1)


export function dateToLocalArray(date) {
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  ]
}

export function arrayToLocalDate(arr) {
  if (!arr.length) {
    return new Date()
  }
  return new Date(
    arr[0],
    arr[1] || 0,
    arr[2] || 1,
    arr[3] || 0,
    arr[4] || 0,
    arr[5] || 0,
  )
}

export function dateToUtcArray(date) {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ]
}

export function arrayToUtcDate(arr) {
  return new Date(Date.UTC.apply(Date, arr))
}


// WEEK UTILS

// https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
export function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
  var localWeekday = (7 + weekday - dow) % 7,
      weekOffset = firstWeekOffset(year, dow, doy),
      dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
      resYear, resDayOfYear;

  if (dayOfYear <= 0) {
      resYear = year - 1;
      resDayOfYear = daysInYear(resYear) + dayOfYear;
  } else if (dayOfYear > daysInYear(year)) {
      resYear = year + 1;
      resDayOfYear = dayOfYear - daysInYear(year);
  } else {
      resYear = year;
      resDayOfYear = dayOfYear;
  }

  return {
      year: resYear,
      dayOfYear: resDayOfYear
  };
}

export function weekOfYear(marker: DateMarker, dow, doy) {
  var year = marker.getUTCFullYear(),
      weekOffset = firstWeekOffset(year, dow, doy),
      week = Math.floor((dayOfYear(marker) - weekOffset - 1) / 7) + 1,
      resWeek, resYear;

  if (week < 1) {
      resYear = year - 1;
      resWeek = week + weeksInYear(resYear, dow, doy);
  } else if (week > weeksInYear(year, dow, doy)) {
      resWeek = week - weeksInYear(year, dow, doy);
      resYear = year + 1;
  } else {
      resYear = year;
      resWeek = week;
  }

  return {
      week: resWeek,
      year: resYear
  }
}

function dayOfYear(marker: DateMarker) { // TODO: use a day diff util?
  return Math.round(
    (
      arrayToUtcDate([
        marker.getUTCFullYear(),
        marker.getUTCMonth(),
        marker.getUTCDate()
      ]).valueOf() -
      arrayToUtcDate([
        marker.getUTCFullYear(),
        0,
        1
      ]).valueOf()
    ) / 864e5
  )
}

function weeksInYear(year, dow, doy) {
  var weekOffset = firstWeekOffset(year, dow, doy),
      weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
  return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
}

// start-of-first-week - start-of-year
function firstWeekOffset(year, dow, doy) {
  var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
      fwd = 7 + dow - doy,
      // first-week day local weekday -- which local weekday is fwd
      fwdlw = (7 + arrayToUtcDate([ year, 0, fwd ]).getUTCDay() - dow) % 7;
  return -fwdlw + fwd - 1;
}

function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
