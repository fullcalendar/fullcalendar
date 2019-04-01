describe('eventLimit popover', function() {

  /** @type {any} */
  var testEvents = [
    { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
    { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
    { title: 'event3', start: '2014-07-29', className: 'event3' },
    { title: 'event4', start: '2014-07-29', className: 'event4' }
  ]

  pushOptions({
    defaultView: 'dayGridMonth',
    defaultDate: '2014-08-01',
    eventLimit: 3,
    events: testEvents,
    dragScroll: false, // don't do autoscrolling while dragging. close quarters in PhantomJS
    popoverViewportConstrain: false, // because PhantomJS window is small, don't do smart repositioning
    handleWindowResize: false // because showing the popover causes scrollbars and fires resize
  })

  function init() {
    $('.fc-more').simulate('click')
  }

  describeOptions('defaultView', {
    'when in month view': 'dayGridMonth',
    'when in dayGridWeek view': 'dayGridWeek',
    'when in week view': 'timeGridWeek'
  }, function() {

    it('aligns horizontally with left edge of cell if LTR', function() {
      initCalendar({
        dir: 'ltr'
      })
      init()
      var cellLeft = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis):eq(2)').offset().left
      var popoverLeft = $('.fc-more-popover').offset().left
      var diff = Math.abs(cellLeft - popoverLeft)
      expect(diff).toBeLessThan(2)
    })

    it('aligns horizontally with left edge of cell if RTL', function() {
      initCalendar({
        dir: 'rtl'
      })
      init()
      var cell = $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis):eq(4)')
      var cellRight = cell.offset().left + cell.outerWidth()
      var popover = $('.fc-more-popover')
      var popoverRight = popover.offset().left + popover.outerWidth()
      var diff = Math.abs(cellRight - popoverRight)
      expect(diff).toBeLessThan(2)
    })
  })

  describe('when in month view', function() {

    pushOptions({
      defaultView: 'dayGridMonth'
    })

    it('aligns with top of cell', function() {
      initCalendar()
      init()
      var popoverTop = $('.fc-more-popover').offset().top
      var rowTop = $('.fc-day-grid .fc-row:eq(0)').offset().top
      var diff = Math.abs(popoverTop - rowTop)
      expect(diff).toBeLessThan(2)
    })

    it('works with background events', function() {
      testEvents.push({
        start: '2014-07-29',
        rendering: 'background'
      })
      initCalendar({
        events: testEvents
      })
      init()
      expect($('.fc-more-popover .fc-event').length).toBeGreaterThan(1)
      expect($('.fc-more-popover .fc-bgevent').length).toBe(0)
    })

    it('works with events that have invalid end times', function() {
      initCalendar({
        events: [
          { title: 'event1', start: '2014-07-29', end: '2014-07-29' },
          { title: 'event2', start: '2014-07-29', end: '2014-07-28' },
          { title: 'event3', start: '2014-07-29T00:00:00', end: '2014-07-29T00:00:00' },
          { title: 'event4', start: '2014-07-29T00:00:00', end: '2014-07-28T23:00:00' }
        ]
      })
      init()
      expect($('.fc-more-popover .fc-event').length).toBe(4)
    })

    // issue 2385
    it('orders events correctly regardless of ID', function() {
      initCalendar({
        defaultDate: '2012-03-22',
        eventLimit: 3,
        events: [
          {
            id: '39957',
            title: 'event01',
            start: '2012-03-22T11:00:00',
            end: '2012-03-22T11:30:00',
            allDay: false
          },
          {
            id: '40607',
            title: 'event02',
            start: '2012-03-22T16:15:00',
            end: '2012-03-22T16:30:00',
            allDay: false
          },
          {
            id: '40760',
            title: 'event03',
            start: '2012-03-22T16:00:00',
            end: '2012-03-22T16:15:00',
            allDay: false
          },
          {
            id: '41284',
            title: 'event04',
            start: '2012-03-22T19:00:00',
            end: '2012-03-22T19:15:00',
            allDay: false
          },
          {
            id: '41645',
            title: 'event05',
            start: '2012-03-22T11:30:00',
            end: '2012-03-22T12:00:00',
            allDay: false
          },
          {
            id: '41679',
            title: 'event07',
            start: '2012-03-22T12:00:00',
            end: '2012-03-22T12:15:00',
            allDay: false
          },
          {
            id: '42246',
            title: 'event08',
            start: '2012-03-22T16:45:00',
            end: '2012-03-22T17:00:00',
            allDay: false
          }
        ]
      })
      init()

      var titles = $('.fc-more-popover .fc-event .fc-title').map(function() {
        return $(this).text()
      }).get()

      expect(titles).toEqual([
        'event01', 'event05', 'event07', 'event03', 'event02', 'event08', 'event04'
      ])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/3856
    it('displays multi-day events only once', function() {
      initCalendar({
        defaultDate: '2017-10-04',
        events: [
          {
            title: 'Long event',
            className: 'long-event',
            start: '2017-10-03',
            end: '2017-10-20'
          },
          {
            title: 'Meeting',
            className: 'meeting-event',
            start: '2017-10-04T10:00:00',
            end: '2017-10-04T12:00:00'
          },
          {
            title: 'Lunch 1',
            className: 'lunch1-event',
            start: '2017-10-04T12:00:00'
          },
          {
            title: 'Lunch 2',
            className: 'lunch2-event',
            start: '2017-10-04T14:00:00'
          }
        ]
      })
      init()

      expect($('.fc-popover .fc-event').length).toBe(4)

      var longEventEl = $('.fc-popover .long-event')
      expect(longEventEl.length).toBe(1)
      expect(longEventEl).toHaveClass('fc-not-start')
      expect(longEventEl).toHaveClass('fc-not-end')
      expect(longEventEl).not.toHaveClass('fc-start')
      expect(longEventEl).not.toHaveClass('fc-end');

      [
        $('.fc-popover .meeting-event'),
        $('.fc-popover .lunch1-event'),
        $('.fc-popover .lunch2-event')
      ].forEach(function(el) {
        expect(el.length).toBe(1)
        expect(el).toHaveClass('fc-start')
        expect(el).toHaveClass('fc-end')
        expect(el).not.toHaveClass('fc-not-start')
        expect(el).not.toHaveClass('fc-not-end')
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4331
    it('displays events that were collapsed in previous days', function() {
      initCalendar({
        defaultDate: '2018-10-01',
        events: [
          {
            title: 'e1',
            start: '2018-10-18'
          },
          {
            title: 'e2',
            start: '2018-10-18'
          },
          {
            title: 'e3',
            start: '2018-10-18T11:00:00'
          },
          {
            title: 'e4',
            start: '2018-10-18T12:00:00',
            end: '2018-10-19T12:00:00'
          },
          {
            title: 'e5',
            start: '2018-10-19',
            className: 'event-e5'
          }
        ]
      })

      // click the second +more link
      $('.event-e5').closest('.fc-event-container').find('.fc-more')
        .simulate('click')
    })

  })

  describeOptions('defaultView', {
    'when in dayGridWeek view': 'dayGridWeek',
    'when in week view': 'timeGridWeek'
  }, function() {
    it('aligns with top of header', function() {
      initCalendar()
      init()
      var popoverTop = $('.fc-more-popover').offset().top
      var headTop = $('.fc-view > table > thead .fc-row').offset().top
      var diff = Math.abs(popoverTop - headTop)
      expect(diff).toBeLessThan(2)
    })
  })

  // TODO: somehow test how the popover does to the edge of any scroll container

  it('closes when user clicks the X', function() {
    initCalendar()
    init()
    expect($('.fc-more-popover')).toBeVisible()
    $('.fc-more-popover .fc-close').simulate('click')
    expect($('.fc-more-popover')).not.toBeVisible()
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4584
  it('doesn\'t fire a dateClick', function(done) {
    let dateClickCalled = false

    spyOnCalendarCallback('dateClick', function() {
      dateClickCalled = true
    })

    initCalendar()
    init()

    let $headerEl = $('.fc-popover .fc-header')
    expect($headerEl).toBeVisible()

    $.simulateMouseClick($headerEl) // better for actual coordinates i think
    setTimeout(function() { // because click would take some time to register
      expect(dateClickCalled).toBe(false)
      done()
    }, 500)
  })

  it('doesn\'t close when user clicks somewhere inside of the popover', function() {
    initCalendar()
    init()
    expect($('.fc-more-popover')).toBeVisible()
    expect($('.fc-more-popover .fc-header')).toBeInDOM()
    $('.fc-more-popover .fc-header').simulate('mousedown').simulate('click')
    expect($('.fc-more-popover')).toBeVisible()
  })

  it('closes when user clicks outside of the popover', function() {
    initCalendar()
    init()
    expect($('.fc-more-popover')).toBeVisible()
    $('body').simulate('mousedown').simulate('click')
    expect($('.fc-more-popover')).not.toBeVisible()
  })

  it('has the correct event contents', function() {
    initCalendar()
    init()
    expect($('.fc-more-popover .event1')).toBeMatchedBy('.fc-not-start.fc-end')
    expect($('.fc-more-popover .event2')).toBeMatchedBy('.fc-start.fc-not-end')
    expect($('.fc-more-popover .event3')).toBeMatchedBy('.fc-start.fc-end')
    expect($('.fc-more-popover .event4')).toBeMatchedBy('.fc-start.fc-end')
  })

  pushOptions({
    editable: true
  })

  describe('when dragging events out', function() {

    describe('when dragging an all-day event to a different day', function() {

      it('should have the new day and remain all-day', function(done) {

        initCalendar({
          eventDrop: function(arg) {
            expect(arg.event.start).toEqualDate('2014-07-28')
            expect(arg.event.allDay).toBe(true)
            done()
          }
        })

        init()

        setTimeout(function() { // simulate was getting confused about which thing was being clicked :(
          $('.fc-more-popover .event4').simulate('drag', {
            end: $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis):eq(1)') // one day before
          })
        }, 0)
      })
    })

    describe('when dragging a timed event to a whole day', function() {

      it('should move to new day but maintain its time', function(done) {

        testEvents.push({ // add timed event
          title: 'event5',
          start: '2014-07-29T13:00:00',
          className: 'event5'
        })

        initCalendar({
          events: testEvents,
          eventDrop: function(arg) {
            expect(arg.event.start).toEqualDate('2014-07-28T13:00:00Z')
            expect(arg.event.allDay).toBe(false)
            done()
          }
        })

        init()

        setTimeout(function() { // simulate was getting confused about which thing was being clicked :(
          $('.fc-more-popover .event5').simulate('drag', {
            end: $('.fc-day-grid .fc-row:eq(0) .fc-bg td:not(.fc-axis):eq(1)') // one day before
          })
        }, 0)
      })
    })

    describe('when dragging a whole day event to a timed slot', function() {

      it('should assume the new time, with a cleared end', function(done) {

        initCalendar({
          defaultView: 'timeGridWeek',
          scrollTime: '00:00:00',
          eventDrop: function(arg) {
            expect(arg.event.start).toEqualDate('2014-07-30T03:00:00Z')
            expect(arg.event.allDay).toBe(false)
            done()
          }
        })

        init()

        setTimeout(function() { // simulate was getting confused about which thing was being clicked :(
          $('.fc-more-popover .event4').simulate('drag', {
            localPoint: {
              left: '0%', // leftmost is guaranteed to be over the 30th
              top: '50%'
            },
            end: $('.fc-slats tr:eq(6)') // the middle will be 7/30, 3:00am
          })
        }, 0)
      })
    })

    describe('when a single-day event isn\'t dragged out all the way', function() {

      it('shouldn\'t do anything', function(done) {

        initCalendar({
          eventDragStop: function() {
            setTimeout(function() { // try to wait until drag is over. eventMutation won't fire BTW
              expect($('.fc-more-popover')).toBeInDOM()
              done()
            }, 0)
          }
        })

        init()

        setTimeout(function() { // simulate was getting confused about which thing was being clicked :(
          $('.fc-more-popover .event1 .fc-title').simulate('drag', {
            dx: 20
          })
        }, 0)
      })
    })

  })

  it('calls event render handlers', function() {
    var options = {
      events: [
        { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
        { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
        { title: 'event3', start: '2014-07-29', className: 'event3' },
        { title: 'event4', start: '2014-07-29', className: 'event4' }
      ],
      eventRender: function() {},
      eventPositioned: function() {},
      _eventsPositioned: function() {},
      eventDestroy: function() {}
    }

    spyOn(options, 'eventRender')
    spyOn(options, 'eventPositioned')
    spyOn(options, '_eventsPositioned')
    spyOn(options, 'eventDestroy')

    initCalendar(options)

    expect(options.eventRender.calls.count()).toBe(4)
    expect(options.eventPositioned.calls.count()).toBe(4)
    expect(options._eventsPositioned.calls.count()).toBe(1)
    expect(options.eventDestroy.calls.count()).toBe(0)

    $('.fc-more').simulate('click')

    expect(options.eventRender.calls.count()).toBe(8) // +4
    expect(options.eventPositioned.calls.count()).toBe(8) // +4
    expect(options._eventsPositioned.calls.count()).toBe(2) // +1
    expect(options.eventDestroy.calls.count()).toBe(0)

    $('.fc-more-popover .fc-close').simulate('click')

    expect(options.eventRender.calls.count()).toBe(8)
    expect(options.eventPositioned.calls.count()).toBe(8)
    expect(options._eventsPositioned.calls.count()).toBe(2)
    expect(options.eventDestroy.calls.count()).toBe(4) // +4
  })

})
