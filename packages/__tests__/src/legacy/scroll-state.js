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

    it('should be maintained when resizing window', function(done) {
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

    it('should be maintained when after rerendering events', function() {
      initCalendar({
        events: [ {
          start: '2015-02-20'
        } ]
      }, calendarEl)

      let scrollEl = $('.fc-scroller', calendarEl)
      let eventEl0 = $('.fc-event', calendarEl)
      expect(eventEl0.length).toBe(1)

      scrollEl.scrollTop(9999) // all the way
      let scroll0 = scrollEl.scrollTop()
      currentCalendar.render()

      let eventEl1 = $('.fc-event', calendarEl)
      expect(eventEl1.length).toBe(1)
      expect(eventEl1[0]).not.toBe(eventEl0[0]) // ensure it a rerender
      expect(scrollEl.scrollTop()).toBe(scroll0)
    })
  }
})
