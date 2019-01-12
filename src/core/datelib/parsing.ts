import { isValidDate } from './marker'

const ISO_START = /^\s*\d{4}-\d\d-\d\d([T ]\d)?/
const ISO_TZO_RE = /(?:(Z)|([-+])(\d\d)(?::(\d\d))?)$/

export function parse(str) {
  let timeZoneOffset = null
  let isTimeUnspecified = false
  let m = ISO_START.exec(str)

  if (m) {
    isTimeUnspecified = !m[1]

    if (isTimeUnspecified) {
      str += 'T00:00:00Z'
    } else {
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
    }
  }

  let marker = new Date(str)

  if (!isValidDate(marker)) {
    return null
  }

  return {
    marker,
    isTimeUnspecified,
    timeZoneOffset
  }
}
