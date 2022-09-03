import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('hiddenDays', () => {
  const DOW_CLASSNAMES = CalendarWrapper.DOW_CLASSNAMES

  describe('when using default', () => {
    it('should show 7 days of the week', () => {
      let calendar = initCalendar()
      let headerWrapper = new DayGridViewWrapper(calendar).header
      let daysCount = headerWrapper.getCellEls().length
      expect(daysCount).toEqual(7)
    })
  })

  describe('when setting an empty hiddenDays', () => {
    pushOptions({
      hiddenDays: [],
    })

    it('should return 7 days of the week', () => {
      let calendar = initCalendar()
      let headerWrapper = new DayGridViewWrapper(calendar).header
      let daysCount = headerWrapper.getCellEls().length
      expect(daysCount).toEqual(7)
    })
  })

  describe('when setting hiddenDays with 1', () => {
    pushOptions({
      hiddenDays: [1],
    })

    it('should return 6 days', () => {
      let calendar = initCalendar()
      let headerWrapper = new DayGridViewWrapper(calendar).header
      let daysCount = headerWrapper.getCellEls().length
      expect(daysCount).toEqual(6)
    })

    it('should return sun,tue,wed,thu,fri,sat days', () => {
      let calendar = initCalendar()
      let headerWrapper = new DayGridViewWrapper(calendar).header
      let dowEls = headerWrapper.getCellEls()
      expect(dowEls[0]).toHaveClass(DOW_CLASSNAMES[0])
      expect(dowEls[1]).toHaveClass(DOW_CLASSNAMES[2])
      expect(dowEls[2]).toHaveClass(DOW_CLASSNAMES[3])
      expect(dowEls[3]).toHaveClass(DOW_CLASSNAMES[4])
      expect(dowEls[4]).toHaveClass(DOW_CLASSNAMES[5])
      expect(dowEls[5]).toHaveClass(DOW_CLASSNAMES[6])
    })

    it('should expect 7th day to be undefined', () => {
      let calendar = initCalendar()
      let headerWrapper = new DayGridViewWrapper(calendar).header
      let dowEls = headerWrapper.getCellEls()
      expect(dowEls[6]).toBeUndefined()
    })
  })

  describe('when setting hiddenDays with 3,5', () => {
    pushOptions({
      hiddenDays: [3, 5],
    })

    it('should return 6 days', () => {
      let calendar = initCalendar()
      let headerWrapper = new DayGridViewWrapper(calendar).header
      let daysCount = headerWrapper.getCellEls().length
      expect(daysCount).toEqual(5)
    })

    it('should return s,m,t,t,s ', () => {
      let calendar = initCalendar()
      let headerWrapper = new DayGridViewWrapper(calendar).header
      let dowEls = headerWrapper.getCellEls()
      expect(dowEls[0]).toHaveClass(DOW_CLASSNAMES[0])
      expect(dowEls[1]).toHaveClass(DOW_CLASSNAMES[1])
      expect(dowEls[2]).toHaveClass(DOW_CLASSNAMES[2])
      expect(dowEls[3]).toHaveClass(DOW_CLASSNAMES[4])
      expect(dowEls[4]).toHaveClass(DOW_CLASSNAMES[6])
    })
  })

  describe('when setting all hiddenDays', () => {
    it('should expect to throw an exception', () => {
      expect(() => {
        initCalendar({
          hiddenDays: [0, 1, 2, 3, 4, 5, 6],
        })
      }).toThrow(new Error('invalid hiddenDays'))
    })
  })
})
