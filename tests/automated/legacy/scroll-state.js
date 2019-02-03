describe('scroll state', function() {
  var calendarEl

  beforeEach(function() {
    calendarEl = $('<div id="calendar">').width(800).appendTo('body')
  })
  afterEach(function() {
    calendarEl.remove()
    calendarEl = null
  })

  pushOptions({
    defaultDate: '2015-02-20',
    contentHeight: 200
  })

  describe('when in month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth'
    })
    defineTests()
  })

  describe('when in week view', function() {
    pushOptions({
      defaultView: 'timeGridWeek',
      scrollTime: '00:00'
    })
    defineTests()
  })

  function defineTests() {

    it('should be maintained when moving resizing window', function(done) {
      var scrollEl
      var scroll0

      initCalendar({
        windowResize: function() {
          setTimeout(function() { // wait until all other tasks are finished
            expect(scrollEl.scrollTop()).toBe(scroll0)
            done()
          }, 0)
        }
      }, calendarEl)
      scrollEl = $('.fc-scroller', calendarEl)

      setTimeout(function() { // wait until after browser's scroll state is applied
        scrollEl.scrollTop(9999) // all the way
        scroll0 = scrollEl.scrollTop()
        $(window).simulate('resize')
      }, 0)
    })

    it('should be maintained when after rerendering events', function(done) {
      var calls = 0
      var eventEl0
      var eventEl1
      var scrollEl
      var scroll0

      initCalendar({
        events: [ {
          start: '2015-02-20'
        } ],
        _eventsPositioned: function() {
          if (++calls === 1) {
            eventEl0 = $('.fc-event', calendarEl)
            expect(eventEl0.length).toBe(1)

            setTimeout(function() { // wait until after browser's scroll state is applied
              scrollEl.scrollTop(9999) // all the way
              scroll0 = scrollEl.scrollTop()
              currentCalendar.rerenderEvents()
            }, 0)
          } else {
            eventEl1 = $('.fc-event', calendarEl)
            expect(eventEl1.length).toBe(1)
            expect(eventEl1[0]).not.toBe(eventEl0[0]) // ensure it a rerender
            expect(scrollEl.scrollTop()).toBe(scroll0)
            done()
          }
        }
      }, calendarEl)
      scrollEl = $('.fc-scroller', calendarEl)
    })
  }
})
