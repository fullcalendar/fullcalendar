import * as EventRenderUtils from './EventRenderUtils'

describe('validRange event rendering', function() {

  describe('with start constraint', function() {

    describe('when month view', function() {
      pushOptions({
        defaultView: 'dayGridMonth',
        defaultDate: '2017-06-01',
        validRange: { start: '2017-06-07' }
      })

      describe('when event is partially before', function() {
        pushOptions({
          events: [
            { start: '2017-06-05', end: '2017-06-09' }
          ]
        })

        it('truncates the event\'s beginning', function() {
          initCalendar()
          EventRenderUtils.expectIsStart(false)
          EventRenderUtils.expectIsEnd(true)
          // TODO: more test about positioning
        })
      })
    })
  })

  describe('with end constraint', function() {

    describe('when month view', function() {
      pushOptions({
        defaultView: 'dayGridMonth',
        defaultDate: '2017-06-01',
        validRange: { end: '2017-06-07' }
      })

      describe('when event is partially before', function() {
        pushOptions({
          events: [
            { start: '2017-06-05', end: '2017-06-09' }
          ]
        })

        it('truncates the event\'s end', function() {
          initCalendar()
          EventRenderUtils.expectIsStart(true)
          EventRenderUtils.expectIsEnd(false)
          // TODO: more test about positioning
        })
      })
    })
  })
})
