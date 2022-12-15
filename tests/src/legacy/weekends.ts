import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'

describe('when weekends option is set', () => {
  it('should show sat and sun if true', () => {
    let calendar = initCalendar({
      weekends: true,
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getDayEls(0).length).toBeGreaterThan(0) // 0=sunday
    expect(dayGridWrapper.getDayEls(6).length).toBeGreaterThan(0) // 6=saturday
  })

  it('should not show sat and sun if false', () => {
    let calendar = initCalendar({
      weekends: false,
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getDayEls(0).length).toBe(0) // 0=sunday
    expect(dayGridWrapper.getDayEls(6).length).toBe(0) // 6=saturday
  })
})
