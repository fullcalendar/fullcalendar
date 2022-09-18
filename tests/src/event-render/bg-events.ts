import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'

describe('background event', () => {
  pushOptions({
    initialDate: '2020-06-23',
  })

  describe('that are timed', () => {
    pushOptions({
      events: [
        {
          start: '2020-06-23T12:00:00',
          end: '2020-06-23T14:00:00',
          display: 'background',
        },
      ],
    })

    it('won\'t appear in daygrid', () => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      let eventEls = dayGridWrapper.getBgEventEls()
      expect(eventEls.length).toBe(0)
    })
  })
})
