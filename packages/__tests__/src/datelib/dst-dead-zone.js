
/*
Some hours don't exist in local time when a daylight-savings shift happpens.
This time is called a "dead zone".
If possible, this function returns an array of two dates,
the date just before the dead zone (with a 999 millisecond time)
and the date just after the dead zone.

I apologize for the unreadability of this code. It was written a long time ago:
https://github.com/arshaw/xdate/blob/master/test/old.js
*/
export function getDSTDeadZone() {
  var dstDates = getDSTDates()

  if (dstDates) {
    var prior = new Date(dstDates[0].valueOf() - 1)

    if (Math.abs(dstDates[0].getHours() - prior.getHours()) > 1) {
      return [prior, dstDates[0]]
    }

    prior = new Date(dstDates[1].valueOf() - 1)

    if (Math.abs(dstDates[1].getHours() - prior.getHours()) > 1) {
      return [prior, dstDates[1]]
    }
  }
}

function getDSTDates() {
  var MS_DAY = 86400000
  var res = []
  var d0 = new Date()
  var overAYear = new Date(+d0)

  overAYear.setFullYear(overAYear.getFullYear() + 1)
  overAYear = new Date(overAYear.valueOf() + MS_DAY)

  while (d0 < overAYear) {
    var d1 = new Date(d0.valueOf() + MS_DAY)
    if (d0.getTimezoneOffset() !== d1.getTimezoneOffset()) {
      res.push(new Date(narrowDSTDate(+d0, +d1)))
      if (res.length === 2) {
        break
      }
    }
    d0 = d1
  }

  return res.length === 2 ? res : null
}

function narrowDSTDate(start, end) {
  if (end <= start + 1) {
    return end
  }

  var mid = start + Math.floor((end - start) / 2)
  var midTZO = new Date(mid).getTimezoneOffset()
  var startTZO = new Date(start).getTimezoneOffset()
  var endTZO = new Date(end).getTimezoneOffset()

  if (midTZO === startTZO) {
    return narrowDSTDate(mid, end)
  } else if (midTZO === endTZO) {
    return narrowDSTDate(start, mid)
  }
}
