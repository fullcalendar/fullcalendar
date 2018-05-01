
const ISO_TIME_RE = /^\s*\d{4}-\d\d-\d\d[T ]\d/
const ISO_TZO_RE = /(?:(Z)|([-+])(\d\d)(?::(\d\d))?)$/

// TODO: accept a Date object somehow!!!

export function parse(str) {
  let timeZoneOffset = null
  let hasTime = false

  if (ISO_TIME_RE.test(str)) {
    hasTime = true

    str = str.replace(ISO_TZO_RE, function(whole, z, sign, minutes, seconds) {
      if (z) {
        timeZoneOffset = 0
      } else {
        timeZoneOffset = (
          parseInt(minutes, 10) * 60 +
          parseInt(seconds || 0, 10)
        ) * (sign === '-' ? -1 : 1)
      }
      return ''
    }) + '-00:00' // otherwise will parse in local
  }

  return {
    marker: new Date(str),
    hasTime,
    timeZoneOffset
  }
}
