
export function formatIsoTimeZoneOffset(date) {
  let minutes = date.getTimezoneOffset()
  let sign = minutes < 0 ? '+' : '-' // whaaa
  let abs = Math.abs(minutes)
  let hours = Math.floor(abs / 60)
  let mins = Math.round(abs % 60)

  return sign + pad(hours) + ':' + pad(mins)
}

export function formatPrettyTimeZoneOffset(date) {
  let minutes = date.getTimezoneOffset()
  let sign = minutes < 0 ? '+' : '-' // whaaa
  let abs = Math.abs(minutes)
  let hours = Math.floor(abs / 60)
  let mins = Math.round(abs % 60)

  return 'GMT' + sign + hours + (mins ? ':' + pad(mins) : '')
}

function pad(n) { // always pads for 2 digits
  return n < 10 ? '0' + n : '' + n
}

export function formatIsoDay(date) {
  return date.toISOString().replace(/T.*/, '')
}

export function formatIsoTime(date) {
  return pad(date.getUTCHours()) + ':' +
    pad(date.getUTCMinutes()) + ':' +
    pad(date.getUTCSeconds())
}

export function formatIsoWithoutTz(date) {
  return date.toISOString().replace(/(Z|[-+]\d\d:\d\d)$/, '').replace('.000', '')
}

export function parseIsoAsUtc(s) {

  if (s.length <= 10) {
    s += 'T00:00:00Z'
  } else if (s.indexOf('Z') === -1) {
    s += 'Z'
  }

  var d = new Date(s)

  if (isNaN(d.valueOf())) {
    throw new Error(s + ' is not valid date input')
  }

  return d
}

export function ensureDate(input) {
  if (input instanceof Date) {
    return input
  } else if (typeof input === 'string') {
    return parseIsoAsUtc(input)
  } else if (typeof input === 'number') {
    return new Date(input)
  }

  throw new Error(input + ' is invalid date input')
}
