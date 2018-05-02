
const ISO_START = /^\s*\d{4}-\d\d-\d\d([T ]\d)?/
const ISO_TZO_RE = /(?:(Z)|([-+])(\d\d)(?::(\d\d))?)$/

export function parse(str) {
  let timeZoneOffset = null
  let hasTime = false
  let m = ISO_START.exec(str)

  if (m) {
    hasTime = Boolean(m[1])

    if (hasTime) {
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
      }) + 'Z' // otherwise will parse in local

    } else {
      str += 'T00:00:00Z'
    }
  }

  return {
    marker: new Date(str),
    hasTime,
    timeZoneOffset
  }
}
