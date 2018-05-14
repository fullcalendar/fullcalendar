describe('ListView rendering', function() {
  pushOptions({
    defaultView: 'listWeek',
    now: '2016-08-20'
  })

  describe('with all-day events', function() {

    describe('when single-day', function() {
      pushOptions({
        events: [
          {
            title: 'event 1',
            start: '2016-08-15'
          },
          {
            title: 'event 2',
            start: '2016-08-17'
          }
        ]
      })

      it('renders only days with events', function() {
        initCalendar()

        var days = getDayInfo()
        var events = getEventInfo()

        expect(days.length).toBe(2)
        expect(days[0].date.format()).toEqual('2016-08-15')
        expect(days[1].date.format()).toEqual('2016-08-17')

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('all-day')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('all-day')
      })

      it('filters events through eventRender', function() {
        var options = {}
        options.eventRender = function(event, el) {
          el.find('.fc-event-dot').replaceWith('<span class="custom-icon" />')
        }

        initCalendar(options)

        expect($('.custom-icon').length).toBe(2)
      })
    })

    describe('when multi-day', function() {
      pushOptions({
        events: [
          {
            title: 'event 1',
            start: '2016-08-15',
            end: '2016-08-18' // 3 days
          }
        ]
      })

      it('renders all-day for every day', function() {
        initCalendar()

        var events = getEventInfo()

        expect(events.length).toBe(3)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('all-day')
        expect(events[1].title).toBe('event 1')
        expect(events[1].timeText).toBe('all-day')
        expect(events[2].title).toBe('event 1')
        expect(events[2].timeText).toBe('all-day')
      })
    })
  })

  describe('with timed events', function() {

    describe('when single-day', function() {
      pushOptions({
        events: [
          {
            title: 'event 1',
            start: '2016-08-15T07:00'
          },
          {
            title: 'event 2',
            start: '2016-08-17T09:00',
            end: '2016-08-17T11:00'
          }
        ]
      })

      it('renders times', function() {
        initCalendar()

        var events = getEventInfo()

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('7:00am')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('9:00am - 11:00am')
      })

      it('doesn\'t render times when displayEventTime is false', function() {
        var options = {}
        options.displayEventTime = false
        initCalendar(options)

        var events = getEventInfo()

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('')
      })

      it('doesn\'t render end times when displayEventEnd is false', function() {
        var options = {}
        options.displayEventEnd = false
        initCalendar(options)

        var events = getEventInfo()

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('7:00am')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('9:00am')
      })

      // regression test for when localized event dates get unlocalized and leak into view rendering
      it('renders dates and times in locale', function() {
        var options = {}
        options.locale = 'fr'
        initCalendar(options)

        var days = getDayInfo()
        var events = getEventInfo()

        expect(days.length).toBe(2)
        expect(days[0].date.format()).toEqual('2016-08-15')
        expect(days[0].mainText).toEqual('lundi')
        expect(days[0].altText).toEqual('15 août 2016')
        expect(days[1].date.format()).toEqual('2016-08-17')
        expect(days[1].mainText).toEqual('mercredi')
        expect(days[1].altText).toEqual('17 août 2016')

        expect(events.length).toBe(2)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('07:00')
        expect(events[1].title).toBe('event 2')
        expect(events[1].timeText).toBe('09:00 - 11:00')
      })
    })

    describe('when multi-day', function() {
      pushOptions({
        nextDayThreshold: '00:00'
      })

      it('renders partial and full days', function() {
        var options = {}
        options.events = [
          {
            title: 'event 1',
            start: '2016-08-15T07:00',
            end: '2016-08-17T11:00'
          }
        ]
        initCalendar(options)

        var events = getEventInfo()

        expect(events.length).toBe(3)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('7:00am - 12:00am')
        expect(events[1].title).toBe('event 1')
        expect(events[1].timeText).toBe('all-day')
        expect(events[2].title).toBe('event 1')
        expect(events[2].timeText).toBe('12:00am - 11:00am')
      })

      it('truncates an out-of-range start', function() {
        var options = {}
        options.events = [
          {
            title: 'event 1',
            start: '2016-08-13T07:00',
            end: '2016-08-16T11:00'
          }
        ]
        initCalendar(options)

        var events = getEventInfo()

        expect(events.length).toBe(3)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('all-day')
        expect(events[1].title).toBe('event 1')
        expect(events[1].timeText).toBe('all-day')
        expect(events[2].title).toBe('event 1')
        expect(events[2].timeText).toBe('12:00am - 11:00am')
      })

      it('truncates an out-of-range start', function() {
        var options = {}
        options.events = [
          {
            title: 'event 1',
            start: '2016-08-18T07:00',
            end: '2016-08-21T11:00'
          }
        ]
        initCalendar(options)

        var events = getEventInfo()

        expect(events.length).toBe(3)
        expect(events[0].title).toBe('event 1')
        expect(events[0].timeText).toBe('7:00am - 12:00am')
        expect(events[1].title).toBe('event 1')
        expect(events[1].timeText).toBe('all-day')
        expect(events[2].title).toBe('event 1')
        expect(events[2].timeText).toBe('all-day')
      })
    })

    it('renders same days when equal to nextDayThreshold', function() {
      var options = {}
      options.nextDayThreshold = '09:00'
      options.events = [
        {
          title: 'event 1',
          start: '2016-08-15T07:00',
          end: '2016-08-17T09:00'
        }
      ]

      initCalendar(options)

      var events = getEventInfo()

      expect(events.length).toBe(3)
      expect(events[0].title).toBe('event 1')
      expect(events[0].timeText).toBe('7:00am - 12:00am')
      expect(events[1].title).toBe('event 1')
      expect(events[1].timeText).toBe('all-day')
      expect(events[2].title).toBe('event 1')
      expect(events[2].timeText).toBe('12:00am - 9:00am')
    })

    it('renders fewer days when before nextDayThreshold', function() {
      var options = {}
      options.nextDayThreshold = '09:00'
      options.events = [
        {
          title: 'event 1',
          start: '2016-08-15T07:00',
          end: '2016-08-17T08:00'
        }
      ]

      initCalendar(options)

      var events = getEventInfo()

      expect(events.length).toBe(2)
      expect(events[0].title).toBe('event 1')
      expect(events[0].timeText).toBe('7:00am - 12:00am')
      expect(events[1].title).toBe('event 1')
      expect(events[1].timeText).toBe('12:00am - 8:00am')
    })
  })

  describe('when an event has no title', function() {
    it('renders no text for its title', function() {
      var options = {}
      options.events = [
        {
          start: '2016-08-15'
        }
      ]
      initCalendar(options)

      var events = getEventInfo()

      expect(events.length).toBe(1)
      expect(events[0].title).toBe('')
      expect(events[0].timeText).toBe('all-day')
    })
  })

  describe('when no events', function() {
    it('renders an empty message', function() {
      initCalendar()
      expect(getIsEmptyMessage()).toBe(true)
    })
  })

  describe('with lots of events', function() {
    pushOptions({
      now: '2016-08-29',
      events: [
        {
          title: 'All Day Event',
          start: '2016-08-29'
        },
        {
          title: 'Long Event',
          start: '2016-08-28',
          end: '2016-09-04'
        },
        {
          title: 'Meeting',
          start: '2016-08-29T10:30:00'
        },
        {
          title: 'Lunch',
          start: '2016-08-30T12:00:00'
        },
        {
          title: 'Meeting',
          start: '2016-08-30T14:30:00'
        },
        {
          title: 'Happy Hour',
          start: '2014-11-12T17:30:00'
        },
        {
          title: 'Dinner',
          start: '2014-11-12T20:00:00'
        },
        {
          title: 'Birthday Party',
          start: '2016-08-29T07:00:00'
        },
        {
          title: 'Click for Google',
          url: 'http://google.com/',
          start: '2016-08-31'
        }
      ]
    })

    it('sorts events correctly', function() {
      initCalendar()

      var days = getDayInfo()
      var events = getEventInfo()

      expect(days.length).toBe(7)
      expect(days[0].date.format()).toEqual('2016-08-28')
      expect(days[1].date.format()).toEqual('2016-08-29')
      expect(days[2].date.format()).toEqual('2016-08-30')
      expect(days[3].date.format()).toEqual('2016-08-31')
      expect(days[4].date.format()).toEqual('2016-09-01')
      expect(days[5].date.format()).toEqual('2016-09-02')
      expect(days[6].date.format()).toEqual('2016-09-03')

      expect(events.length).toBe(13)
      expect(events[0].title).toBe('Long Event')
      expect(events[0].timeText).toBe('all-day')
      expect(events[1].title).toBe('Long Event')
      expect(events[1].timeText).toBe('all-day')
      expect(events[2].title).toBe('All Day Event')
      expect(events[2].timeText).toBe('all-day')
      expect(events[3].title).toBe('Birthday Party')
      expect(events[3].timeText).toBe('7:00am')
      expect(events[4].title).toBe('Meeting')
      expect(events[4].timeText).toBe('10:30am')
      expect(events[5].title).toBe('Long Event')
      expect(events[5].timeText).toBe('all-day')
      expect(events[6].title).toBe('Lunch')
      expect(events[6].timeText).toBe('12:00pm')
      expect(events[7].title).toBe('Meeting')
      expect(events[7].timeText).toBe('2:30pm')
      expect(events[8].title).toBe('Long Event')
      expect(events[8].timeText).toBe('all-day')
      expect(events[9].title).toBe('Click for Google')
      expect(events[9].timeText).toBe('all-day')
      expect(events[10].title).toBe('Long Event')
      expect(events[10].timeText).toBe('all-day')
      expect(events[11].title).toBe('Long Event')
      expect(events[11].timeText).toBe('all-day')
      expect(events[12].title).toBe('Long Event')
      expect(events[12].timeText).toBe('all-day')
    })

    it('makes scrollbars', function() {
      let $el = $('<div style="width:300px" />').appendTo('body')
      initCalendar({
        header: false
      }, $el)
      let $scrollEl = $('.fc-view .fc-scroller')
      expect(
        $scrollEl[0].scrollHeight
      ).toBeGreaterThan(
        $scrollEl[0].clientHeight + 100
      )
      $el.remove()
    })

    it('doesn\'t have scrollbars when height is \'auto\'', function() {
      let $el = $('<div style="width:300px" />').appendTo('body')
      initCalendar({
        header: false,
        height: 'auto'
      }, $el)
      let $scrollEl = $('.fc-view .fc-scroller')
      expect(
        Math.abs($scrollEl[0].scrollHeight - $scrollEl[0].clientHeight)
      ).toBeLessThan(2)
      $el.remove()
    })
  })

  it('updates rendered events despite fetch range being lazy', function() {
    var options = {}
    options.now = '2016-09-12'
    options.defaultView = 'month'
    options.events = [
      { title: 'event1', start: '2016-09-12' }
    ]

    initCalendar(options)
    currentCalendar.changeView('listWeek')

    expect($('.fc-list-item').length).toBe(1)

    currentCalendar.prev()

    expect($('.fc-list-item').length).toBe(0)
  })

  function getDayInfo() {
    return $('.fc-list-heading').map(function(i, el) {
      el = $(el)
      return {
        mainText: el.find('.fc-list-heading-main').text() || '',
        altText: el.find('.fc-list-heading-alt').text() || '',
        date: $.fullCalendar.moment(el.data('date'))
      }
    }).get()
  }

  function getEventInfo() { // gets all *segments*
    return $('.fc-list-item').map(function(i, el) {
      el = $(el)
      return {
        title: el.find('.fc-list-item-title').text() || '', // text!
        timeText: el.find('.fc-list-item-time').text() || '' // text!
      }
    }).get()
  }

  function getIsEmptyMessage() {
    return Boolean($('.fc-list-empty').length)
  }
})
