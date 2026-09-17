const persianDayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', { day: 'numeric' })

/*
Finds the first day of the Jalali/Persian calendar month containing the given date.
Does not mutate the input Date. Returns a new Date set to local midnight.
*/
export function findDayOne(date: Date): Date {
  // anchored at noon while searching, to avoid landing in a DST gap/overlap at midnight
  let cur = new Date(date.valueOf())
  cur.setHours(12, 0, 0, 0)

  while (persianDayFormatter.format(cur) !== '1') {
    cur.setDate(cur.getDate() - 1)
  }

  cur.setHours(0, 0, 0, 0)
  return cur
}
