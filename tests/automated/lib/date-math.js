
export function startOfLocalDay(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
}

export function addLocalDays(date, n) {
  let newDate = new Date(date.valueOf())
  newDate.setDate(newDate.getDate() + n)
  return newDate
}

export function startOfUtcDay(date) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ))
}

export function addUtcDays(date, n) {
  let newDate = new Date(date.valueOf())
  newDate.setUTCDate(newDate.getUTCDate() + n)
  return newDate
}
