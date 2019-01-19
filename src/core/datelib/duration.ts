import { isInt } from '../util/misc'

export type DurationInput = DurationObjectInput | string | number

export interface DurationObjectInput {
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
  years: number
  months: number
  days: number
  milliseconds: number
}

const INTERNAL_UNITS = [ 'years', 'months', 'days', 'milliseconds' ]
const PARSE_RE = /^(-?)(?:(\d+)\.)?(\d+):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/


// Parsing and Creation

export function createDuration(input: DurationInput, unit?: string): Duration | null {
  if (typeof input === 'string') {
    return parseString(input)
  } else if (typeof input === 'object' && input) { // non-null object
    return normalizeObject(input)
  } else if (typeof input === 'number') {
    return normalizeObject({ [unit || 'milliseconds']: input })
  } else {
    return null
  }
}

function parseString(s: string): Duration {
  let m = PARSE_RE.exec(s)
  if (m) {
    let sign = m[1] ? -1 : 1
    return {
      years: 0,
      months: 0,
      days: sign * (m[2] ? parseInt(m[2], 10) : 0),
      milliseconds: sign * (
        (m[3] ? parseInt(m[3], 10) : 0) * 60 * 60 * 1000 + // hours
        (m[4] ? parseInt(m[4], 10) : 0) * 60 * 1000 + // minutes
        (m[5] ? parseInt(m[5], 10) : 0) * 1000 + // seconds
        (m[6] ? parseInt(m[6], 10) : 0) // ms
      )
    }
  }
  return null
}

function normalizeObject(obj: DurationObjectInput): Duration {
  return {
    years: obj.years || obj.year || 0,
    months: obj.months || obj.month || 0,
    days:
      (obj.days || obj.day || 0) +
      getWeeksFromInput(obj) * 7,
    milliseconds:
      (obj.hours || obj.hour || 0) * 60 * 60 * 1000 + // hours
      (obj.minutes || obj.minute || 0) * 60 * 1000 + // minutes
      (obj.seconds || obj.second || 0) * 1000 + // seconds
      (obj.milliseconds || obj.millisecond || obj.ms || 0) // ms
  }
}

export function getWeeksFromInput(obj: DurationObjectInput) {
  return obj.weeks || obj.week || 0
}


// Equality

export function durationsEqual(d0: Duration, d1: Duration): boolean {
  return d0.years === d1.years &&
    d0.months === d1.months &&
    d0.days === d1.days &&
    d0.milliseconds === d1.milliseconds
}

export function isSingleDay(dur: Duration) {
  return dur.years === 0 && dur.months === 0 && dur.days === 1 && dur.milliseconds === 0
}


// Simple Math

export function addDurations(d0: Duration, d1: Duration) {
  return {
    years: d0.years + d1.years,
    months: d0.months + d1.months,
    days: d0.days + d1.days,
    milliseconds: d0.milliseconds + d1.milliseconds
  }
}

export function subtractDurations(d1: Duration, d0: Duration): Duration {
  return {
    years: d1.years - d0.years,
    months: d1.months - d0.months,
    days: d1.days - d0.days,
    milliseconds: d1.milliseconds - d0.milliseconds
  }
}

export function multiplyDuration(d: Duration, n: number) {
  return {
    years: d.years * n,
    months: d.months * n,
    days: d.days * n,
    milliseconds: d.milliseconds * n
  }
}


// Conversions
// "Rough" because they are based on average-case Gregorian months/years

export function asRoughYears(dur: Duration) {
  return asRoughDays(dur) / 365
}

export function asRoughMonths(dur: Duration) {
  return asRoughDays(dur) / 30
}

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
  return dur.years * (365 * 864e5) +
    dur.months * (30 * 864e5) +
    dur.days * 864e5 +
    dur.milliseconds
}


// Advanced Math

export function wholeDivideDurations(numerator: Duration, denominator: Duration): number {
  let res = null

  for (let i = 0; i < INTERNAL_UNITS.length; i++) {
    let unit = INTERNAL_UNITS[i]

    if (denominator[unit]) {
      let localRes = numerator[unit] / denominator[unit]

      if (!isInt(localRes) || (res !== null && res !== localRes)) {
        return null
      }

      res = localRes

    } else if (numerator[unit]) {
      // needs to divide by something but can't!
      return null
    }
  }

  return res
}

export function greatestDurationDenominator(dur: Duration, dontReturnWeeks?: boolean) {
  let ms = dur.milliseconds
  if (ms) {
    if (ms % 1000 !== 0) {
      return { unit: 'millisecond', value: ms }
    }
    if (ms % (1000 * 60) !== 0) {
      return { unit: 'second', value: ms / 1000 }
    }
    if (ms % (1000 * 60 * 60) !== 0) {
      return { unit: 'minute', value: ms / (1000 * 60) }
    }
    if (ms) {
      return { unit: 'hour', value: ms / (1000 * 60 * 60) }
    }
  }
  if (dur.days) {
    if (!dontReturnWeeks && dur.days % 7 === 0) {
      return { unit: 'week', value: dur.days / 7 }
    }
    return { unit: 'day', value: dur.days }
  }
  if (dur.months) {
    return { unit: 'month', value: dur.months }
  }
  if (dur.years) {
    return { unit: 'year', value: dur.years }
  }
  return { unit: 'millisecond', value: 0 }
}
