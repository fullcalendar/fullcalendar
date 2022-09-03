import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('validRange event dragging', () => {
  describe('when start constraint', () => {
    describe('when in month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
        initialDate: '2017-06-01',
        validRange: { start: '2017-06-06' },
        events: [
          { start: '2017-06-07', end: '2017-06-10' },
        ],
        editable: true,
      })

      it('won\'t go before validRange', (done) => {
        let modifiedEvent: any = false

        let calendar = initCalendar({
          eventDrop(arg) {
            modifiedEvent = arg.event
          },
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        $(dayGridWrapper.getEventEls()).simulate('drag', {
          end: dayGridWrapper.getDayEl('2017-06-06').previousElementSibling, // the invalid day before
          callback() {
            expect(modifiedEvent).toBe(false)
            done()
          },
        })
      })
    })
  })

  describe('when end constraint', () => {
    describe('when in month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
        initialDate: '2017-06-01',
        validRange: { end: '2017-06-09' },
        events: [
          { start: '2017-06-04', end: '2017-06-07' },
        ],
        editable: true,
      })

      it('won\'t go after validRange', (done) => {
        let modifiedEvent: any = false

        let calendar = initCalendar({
          eventDrop(arg) {
            modifiedEvent = arg.event
          },
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        $(dayGridWrapper.getEventEls()).simulate('drag', {
          end: dayGridWrapper.getDayEl('2017-06-08').nextElementSibling, // the invalid day after
          callback() {
            expect(modifiedEvent).toBe(false)
            done()
          },
        })
      })
    })
  })
})
