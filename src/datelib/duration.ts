
export interface DurationObjInput {
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

let re = /^(?:(\d+)\.)?(\d\d):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/

export function createDuration(input, unit?: string) {
  if (typeof input === 'string') {
    return parseString(input)
  } else if (typeof input === 'object') {
    return normalizeObject(input)
  } else if (typeof input === 'number') {
    return {
      year: (unit === 'year' || unit === 'years') ? input : 0,
      month: (unit === 'month' || unit === 'months') ? input : 0,
      day: (unit === 'day' || unit === 'days') ? input : 0,
      time:
        ((unit === 'hour' || unit === 'hours') ? input * 60 * 60 * 1000 : 0) +
        ((unit === 'minute' || unit === 'minutes') ? input * 60 * 1000 : 0) +
        ((unit === 'seconds' || unit === 'second') ? input * 1000 : 0) +
        ((!unit || unit === 'millisecond' || unit === 'milliseconds') ? input : 0)
    }
  } else {
    return null
  }
}

export function addDurations(d0: Duration, d1: Duration) {
  return {
    year: d0.year + d1.year,
    month: d0.month + d1.month,
    day: d0.day + d1.day,
    time: d0.time + d1.time
  }
}

function parseString(s: string): Duration {
  let m = re.exec(s)
  if (m) {
    return {
      year: 0,
      month: 0,
      day: m[1] ? parseInt(m[1], 10) : 0, // todo: do this for others
      time:
        (parseInt(m[2], 10) || 0) * 60 * 60 * 1000 + // hours
        (parseInt(m[3], 10) || 0) * 60 * 1000 + // minutes
        (parseInt(m[4], 10) || 0) * 1000 + // seconds
        (parseInt(m[5], 10) || 0) // ms
    }
  }
  return null
}

function normalizeObject(obj: DurationObjInput): Duration {
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

export function getWeeksFromInput(obj: DurationObjInput) {
  return obj.weeks || obj.week || 0
}

export function durationsEqual(d0: Duration, d1: Duration): boolean {
  return d0.year === d1.year &&
    d0.month === d1.month &&
    d0.day === d1.day &&
    d0.time === d1.time
}

export function diffDurations(d0: Duration, d1: Duration): Duration {
  return {
    year: d1.year - d0.year,
    month: d1.month - d0.month,
    day: d1.day - d0.day,
    time: d1.time - d0.time
  }
}

export function wholeDivideDurationByDuration(numerator: Duration, denominator: Duration): number {
  let res0 = null
  let res1 = null

  if (denominator.year) {
    res0 = numerator.year / denominator.year
  }

  if (denominator.month) {
    res1 = numerator.month / denominator.month

    if (res0 === null || res0 === res1) {
      res0 = res1
    } else {
      return null
    }
  }

  if (denominator.day) {
    res1 = numerator.day / denominator.day

    if (res0 === null || res0 === res1) {
      res0 = res1
    } else {
      return null
    }
  }

  if (denominator.time) {
    res1 = numerator.time / denominator.time

    if (res0 === null || res0 === res1) {
      res0 = res1
    } else {
      return null
    }
  }

  return res0
}

export function isSingleDay(dur: Duration) {
  return dur.year === 0 && dur.month === 0 && dur.day === 1 && dur.time === 0
}


export function computeGreatestUnit(dur: Duration) { // can return null?
  if (dur.time % 1000 !== 0) {
    return 'millisecond'
  }
  if (dur.time % 1000 * 60 !== 0) {
    return 'second'
  }
  if (dur.time % 1000 * 60 * 60 !== 0) {
    return 'minute'
  }
  if (dur.time) { // correct???
    return 'hour'
  }
  if (dur.day) {
    return 'day'
  }
  if (dur.month) {
    return 'month'
  }
  if (dur.year) {
    return 'year'
  }
}


export function multiplyDuration(dur: Duration, n: number) {
  return {
    year: dur.year * n,
    month: dur.month * n,
    day: dur.day * n,
    time: dur.time * n
  }
}


const MS_IN_DAY = 864e5

export function asRoughDays(dur: Duration) { // TODO: use asRoughMs
  return dur.year * 365 + dur.month * 30 + dur.day + dur.time / MS_IN_DAY
}

export function asRoughMs(dur: Duration) {
  return dur.year * (365 * MS_IN_DAY) +
    dur.month * (30 * MS_IN_DAY) +
    dur.day * MS_IN_DAY +
    dur.time
}

export function asRoughMinutes(dur: Duration) {
  return asRoughMs(dur) / 1000 / 60
}

export function asRoughSeconds(dur: Duration) {
  return asRoughMs(dur) / 1000
}
