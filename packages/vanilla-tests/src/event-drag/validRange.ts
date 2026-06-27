import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitTimeout } from '../lib/misc'

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

      it('won\'t go before validRange', async () => {
        let modifiedEvent: any = false

        let calendar = initCalendar({
          eventDrop(info) {
            modifiedEvent = info.event
          },
        })
        await waitTimeout()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        await new Promise<void>((resolve) => {
          $(dayGridWrapper.getEventEls()).simulate('drag', {
            end: dayGridWrapper.getDayEl('2017-06-06').previousElementSibling, // the invalid day before
            callback() {
              expect(modifiedEvent).toBe(false)
              resolve()
            },
          })
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

      it('won\'t go after validRange', async () => {
        let modifiedEvent: any = false

        let calendar = initCalendar({
          eventDrop(info) {
            modifiedEvent = info.event
          },
        })
        await waitTimeout()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        await new Promise<void>((resolve) => {
          $(dayGridWrapper.getEventEls()).simulate('drag', {
            end: dayGridWrapper.getDayEl('2017-06-08').nextElementSibling, // the invalid day after
            callback() {
              expect(modifiedEvent).toBe(false)
              resolve()
            },
          })
        })
      })
    })
  })
})
