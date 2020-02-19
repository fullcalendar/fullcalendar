import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import { waitEventDrag } from '../lib/wrappers/interaction-util'


describe('validRange event dragging', function() {

  describe('when start constraint', function() {

    describe('when in month view', function() {
      pushOptions({
        defaultView: 'dayGridMonth',
        defaultDate: '2017-06-01',
        validRange: { start: '2017-06-06' },
        events: [
          { start: '2017-06-07', end: '2017-06-10' }
        ],
        editable: true
      })

      it('won\'t go before validRange', function(done) {
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        let dragging = dayGridWrapper.dragEventToDate(
          dayGridWrapper.getEventEls()[0],
          '2017-06-08',
          '2017-06-06'
        )

        waitEventDrag(calendar, dragging).then((res) => {
          expect(res).toBe(false)
          done()
        })
      })
    })
  })

  describe('when end constraint', function() {

    describe('when in month view', function() {
      pushOptions({
        defaultView: 'dayGridMonth',
        defaultDate: '2017-06-01',
        validRange: { end: '2017-06-09' },
        events: [
          { start: '2017-06-04', end: '2017-06-07' }
        ],
        editable: true
      })

      it('won\'t go after validRange', function(done) {
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        let dragging = dayGridWrapper.dragEventToDate(
          dayGridWrapper.getEventEls()[0],
          '2017-06-05',
          '2017-06-08'
        )

        waitEventDrag(calendar, dragging).then((res) => {
          expect(res).toBe(false)
          done()
        })
      })
    })
  })
})
