
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

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

export function formatIsoDay(date) {
  return date.toISOString().replace(/T.*/, '')
}

export function formatIsoTime(date) {
  return pad(date.getUTCHours(), 2) + ':' +
    pad(date.getUTCMinutes(), 2) + ':' +
    pad(date.getUTCSeconds(), 2)
}
