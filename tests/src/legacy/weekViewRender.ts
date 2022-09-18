import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('weekViewRender', () => {
  const nowStr = '2018-05-28' // is a Monday

  pushOptions({
    now: nowStr,
    initialView: 'timeGridWeek',
  })

  describe('verify th class for today', () => {
    it('should have today class only on "today"', () => {
      let calendar = initCalendar()
      let headerWrapper = new TimeGridViewWrapper(calendar).header
      let cellInfo = headerWrapper.getCellInfo()

      expect(cellInfo[1].date).toEqualDate(nowStr)
      expect(cellInfo[1].isToday).toBe(true)
    })
  })
})
