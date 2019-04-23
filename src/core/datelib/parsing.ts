import { isValidDate } from './marker'


const ISO_RE = /^\s*(\d{4})(-(\d{2})(-(\d{2})([T ](\d{2}):(\d{2})(:(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/

export function parse(str) {
  let m = ISO_RE.exec(str)

  if (m) {
    let marker = new Date(Date.UTC(
      Number(m[1]),
      m[3] ? Number(m[3]) - 1 : 0,
      Number(m[5] || 1),
      Number(m[7] || 0),
      Number(m[8] || 0),
      Number(m[10] || 0),
      m[12] ? Number('0.' + m[12]) * 1000 : 0
    ))

    if (isValidDate(marker)) {
      let timeZoneOffset = null

      if (m[13]) {
        timeZoneOffset = (m[15] === '-' ? -1 : 1) * (
          Number(m[16] || 0) * 60 +
          Number(m[18] || 0)
        )
      }

      return {
        marker,
        isTimeUnspecified: !m[6],
        timeZoneOffset
      }
    }
  }

  return null
}
