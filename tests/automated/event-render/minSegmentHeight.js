import * as EventRenderUtils from './EventRenderUtils'

describe('short event rendering with agendaEventMinHeight', function() {
  pushOptions({
    defaultView: 'agendaWeek',
    defaultDate: '2017-08-10',
    agendaEventMinHeight: 25
  })

  describe('we we have an isolated short event', function() {
    pushOptions({
      events: [
        { start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00' }
      ]
    })

    it('renders the event having full width and the agendaEventMinHeight height value', function() {
      initCalendar()
      var el = EventRenderUtils.getSingleEl()

      expect(el.outerHeight()).toEqual(25)
    })
  })

  describe('we we have two short events close to each other', function() {
    pushOptions({
      events: [
        { start: '2017-08-10T10:30:00', end: '2017-08-10T10:31:00', title: 'event a' },
        { start: '2017-08-10T10:31:20', end: '2017-08-10T10:31:40', title: 'event b' }
      ]
    })

    it('renders the second short event side by side with the first one', function() {
      initCalendar()
      var el2 = $('.fc-short').eq(1)

      expect(el2.css('left')).not.toEqual('0px')
    })

    it('prevents the events to overlap when we pass the slotEventOverlap: false option', function() {
      initCalendar({
        slotEventOverlap: false
      })

      var el1 = $('.fc-short').eq(0)
      var el2 = $('.fc-short').eq(1)

      expect(el1.css('left')).toEqual('0px')
      expect(el2.css('left')).not.toEqual('0px')
    })
  })
})
