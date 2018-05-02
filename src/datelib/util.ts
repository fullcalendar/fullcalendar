
export type DateMarker = Date

export function nowMarker(): DateMarker {
  return arrayToUtcDate(dateToLocalArray(new Date()))
}


// export function markersEqual(m0: DateMarker, m1)


export function dateToLocalArray(date) {
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  ]
}

export function arrayToLocalDate(arr) {
  if (!arr.length) {
    return new Date()
  }
  return new Date(
    arr[0],
    arr[1] || 0,
    arr[2] || 1,
    arr[3] || 0,
    arr[4] || 0,
    arr[5] || 0,
  )
}

export function dateToUtcArray(date) {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ]
}

export function arrayToUtcDate(arr) {
  return new Date(Date.UTC.apply(Date, arr))
}
