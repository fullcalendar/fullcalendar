
export interface DurationInput {
  years?: number
  year?: number
  months?: number
  month?: number
  weeks?: number
  week?: number
  days?: number
  day?: number
  hours?: number
  hour?: number
  minutes?: number
  minute?: number
  seconds?: number
  second?: number
  milliseconds?: number
  millisecond?: number
  ms?: number
}

export interface Duration {
  year: number
  month: number
  day: number
  time: number
}


// Parsing and Creation

const PARSE_RE = /^(?:(\d+)\.)?(\d\d):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/

export function createDuration(input, unit?: string) {
  if (typeof input === 'string') {
    return parseString(input)
  } else if (typeof input === 'object') {
    return normalizeObject(input)
  } else if (typeof input === 'number') {
    return normalizeObject({ [unit || 'millisecond']: input })
  } else {
    return null
  }
}

function parseString(s: string): Duration {
  let m = PARSE_RE.exec(s)
  if (m) {
    return {
      year: 0,
      month: 0,
      day: m[1] ? parseInt(m[1], 10) : 0,
      time:
        (m[2] ? parseInt(m[2], 10) : 0) * 60 * 60 * 1000 + // hours
        (m[3] ? parseInt(m[3], 10) : 0) * 60 * 1000 + // minutes
        (m[4] ? parseInt(m[4], 10) : 0) * 1000 + // seconds
        (m[5] ? parseInt(m[5], 10) : 0) // ms
    }
  }
  return null
}

function normalizeObject(obj: DurationInput): Duration {
  return {
    year: obj.years || obj.year || 0,
    month: obj.months || obj.month || 0,
    day:
      (obj.days || obj.day || 0) +
      getWeeksFromInput(obj) * 7,
    time:
      (obj.hours || obj.hour || 0) * 60 * 60 * 1000 + // hours
      (obj.minutes || obj.minute || 0) * 60 * 1000 + // minutes
      (obj.seconds || obj.second || 0) * 1000 + // seconds
      (obj.milliseconds || obj.millisecond || obj.ms || 0) // ms
  }
}

export function getWeeksFromInput(obj: DurationInput) {
  return obj.weeks || obj.week || 0
}


// Equality

export function durationsEqual(d0: Duration, d1: Duration): boolean {
  return d0.year === d1.year &&
    d0.month === d1.month &&
    d0.day === d1.day &&
    d0.time === d1.time
}

export function isSingleDay(dur: Duration) {
  return dur.year === 0 && dur.month === 0 && dur.day === 1 && dur.time === 0
}


// Simple Math

export function addDurations(d0: Duration, d1: Duration) {
  return {
    year: d0.year + d1.year,
    month: d0.month + d1.month,
    day: d0.day + d1.day,
    time: d0.time + d1.time
  }
}

export function diffDurations(d0: Duration, d1: Duration): Duration {
  return {
    year: d1.year - d0.year,
    month: d1.month - d0.month,
    day: d1.day - d0.day,
    time: d1.time - d0.time
  }
}

export function multiplyDuration(d: Duration, n: number) {
  return {
    year: d.year * n,
    month: d.month * n,
    day: d.day * n,
    time: d.time * n
  }
}


// Conversions
// "Rough" because they are based on average-case Gregorian months/years

export function asRoughDays(dur: Duration) {
  return asRoughMs(dur) / 864e5
}

export function asRoughHours(dur: Duration) {
  return asRoughMs(dur) / (1000 * 60 * 60)
}

export function asRoughMinutes(dur: Duration) {
  return asRoughMs(dur) / (1000 * 60)
}

export function asRoughSeconds(dur: Duration) {
  return asRoughMs(dur) / 1000
}

export function asRoughMs(dur: Duration) {
  return dur.year * (365 * 864e5) +
    dur.month * (30 * 864e5) +
    dur.day * 864e5 +
    dur.time
}


// Advanced Math

export function wholeDivideDurations(numerator: Duration, denominator: Duration): number {
  let res0 = null
  let res1 = null

  if (denominator.year) {
    res0 = numerator.year / denominator.year
  }

  if (denominator.month) {
    res1 = numerator.month / denominator.month

    if (res0 === null || res0 === res1) { // must match any previous division results
      res0 = res1
    } else {
      return null
    }
  }

  if (denominator.day) {
    res1 = numerator.day / denominator.day

    if (res0 === null || res0 === res1) { // must match any previous division results
      res0 = res1
    } else {
      return null
    }
  }

  if (denominator.time) {
    res1 = numerator.time / denominator.time

    if (res0 === null || res0 === res1) { // must match any previous division results
      res0 = res1
    } else {
      return null
    }
  }

  return res0
}

export function greatestDurationDenominator(dur: Duration, dontReturnWeeks?: boolean) {
  let time = dur.time
  if (time) {
    if (time % 1000 !== 0) {
      return { unit: 'millisecond', value: time }
    }
    if (time % (1000 * 60) ! == 0) {
      return { unit: 'second', value: time / 1000 }
    }
    if (time % (1000 * 60 * 60) !== 0) {
      return { unit: 'minute', value: time / (1000 * 60) }
    }
    if (time) {
      return { unit: 'hour', value: time / (1000 * 60 * 60) }
    }
  }
  if (dur.day) {
    if (!dontReturnWeeks && dur.day % 7 === 0) {
      return { unit: 'week', value: dur.day / 7 }
    }
    return { unit: 'day', value: dur.day }
  }
  if (dur.month) {
    return { unit: 'month', value: dur.month }
  }
  if (dur.year) {
    return { unit: 'year', value: dur.year }
  }
  return { unit: 'millisecond', value: 0 }
}
