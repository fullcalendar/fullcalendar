/*
NOTE: can't use Date.parse or new Date(str) to parse strings without timezones:
https://stackoverflow.com/a/33909265/96342
*/

/*
Given an ISO8601 string with no timezone part, parses as UTC
*/
export function parseUtcDate(str) {
  let parts = str.split(/\D/)

  if (parts.length > 6) { // has timezone info. will correctly parse
    return new Date(str)
  }

  return new Date(Date.UTC(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parts[2] ? parseInt(parts[2], 10) : 0,
    parts[3] ? parseInt(parts[3], 10) : 0,
    parts[4] ? parseInt(parts[4], 10) : 0,
    parts[5] ? parseInt(parts[5], 10) : 0,
  ))
}

/*
Given an ISO8601 string with no timezone part, parses as local
*/
export function parseLocalDate(str) {
  let parts = str.split(/\D/)

  if (parts.length > 6) { // has timezone info
    throw new Error('Don\'t pass timezone info to parseLocalDate. Use parseUtcDate instead.')
  } else {
    return new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parts[2] ? parseInt(parts[2], 10) : 0,
      parts[3] ? parseInt(parts[3], 10) : 0,
      parts[4] ? parseInt(parts[4], 10) : 0,
      parts[5] ? parseInt(parts[5], 10) : 0,
    )
  }
}
