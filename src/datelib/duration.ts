
export interface DurationObjInput {
  years?: number
  year?: number
  months?: number
  month?: number
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

export function createDuration(input) {
  if (typeof input === 'string') {
    return parseString(input)
  } else if (typeof input === 'object') {
    return normalizeObject(input)
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
}

function normalizeObject(obj: DurationObjInput): Duration {
  return {
    year: obj.years || obj.year || 0,
    month: obj.months || obj.month || 0,
    day: obj.days || obj.day || 0,
    time:
      (obj.hours || obj.hour || 0) * 60 * 60 * 1000 + // hours
      (obj.minutes || obj.minute || 0) * 60 * 1000 + // minutes
      (obj.seconds || obj.second || 0) * 1000 + // seconds
      (obj.milliseconds || obj.millisecond || obj.ms || 0) // ms
  }
}

export function durationsEqual(d0: Duration, d1: Duration): boolean {
  return d0.year === d1.year &&
    d0.month === d1.month &&
    d0.day === d1.day &&
    d0.time === d1.time
}
