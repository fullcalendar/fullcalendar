describe('eventRender', function() {

  pushOptions({
    defaultDate: '2014-11-12',
    scrollTime: '00:00:00',
    events: [ {
      title: 'my event',
      start: '2014-11-12T09:00:00'
    } ]
  })

  $.each({
    dayGridMonth: '.fc-day-grid',
    timeGridWeek: '.fc-time-grid'
  }, function(viewName, gridSelector) {
    describe('when in ' + viewName + ' view', function() {

      pushOptions({
        defaultView: viewName
      })

      describe('with foreground event', function() {
        it('receives correct args AND can modify the element', function(done) {
          var options = {
            eventRender: function(arg) {
              expect(typeof arg.event).toBe('object')
              expect(arg.event.rendering).toBe('')
              expect(arg.event.start).toBeDefined()
              expect(arg.el instanceof HTMLElement).toBe(true)
              expect(typeof arg.view).toBe('object')
              expect(arg.isMirror).toBe(false)
              $(arg.el).css('font-size', '20px')
            },
            _eventsPositioned: function() {
              expect($(gridSelector).find('.fc-event').css('font-size')).toBe('20px')
              expect(options.eventRender).toHaveBeenCalled()
              done()
            }
          }
          spyOn(options, 'eventRender').and.callThrough()
          initCalendar(options)
        })
      })
    })
  })

  describe('when in month view', function() {

    pushOptions({
      defaultView: 'dayGridMonth',
      events: [ {
        title: 'my event',
        start: '2014-11-12'
      } ]
    })

    describe('with a foreground event', function() {
      it('can return a new element', function(done) {
        var options = {
          eventRender: function(arg) {
            return $('<div class="fc-event sup" style="background-color:green">sup g</div>')[0]
          },
          _eventsPositioned: function() {
            expect($('.fc-day-grid .sup').length).toBe(1)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })
      it('can return false and cancel rendering', function(done) {
        var options = {
          eventRender: function(arg) {
            return false
          },
          _eventsPositioned: function() {
            expect($('.fc-day-grid .fc-event').length).toBe(0)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })
    })

    describe('with an all-day background event', function() {

      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12',
          rendering: 'background'
        } ]
      })

      it('receives correct args AND can modify the element', function(done) {
        var options = {
          eventRender: function(arg) {
            expect(typeof arg.event).toBe('object')
            expect(arg.event.rendering).toBe('background')
            expect(arg.event.start).toBeDefined()
            expect(arg.el instanceof HTMLElement).toBe(true)
            expect(typeof arg.view).toBe('object')
            $(arg.el).css('font-size', '20px')
          },
          _eventsPositioned: function() {
            expect($('.fc-day-grid .fc-bgevent').css('font-size')).toBe('20px')
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })

      it('can return a new element', function(done) {
        var options = {
          eventRender: function(arg) {
            return $('<td class="sup" style="background-color:green">sup g</td>')[0]
          },
          _eventsPositioned: function() {
            expect($('.fc-day-grid .sup').length).toBe(1)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })

      it('won\'t rendering when returning a new element of the wrong type', function(done) {
        var options = {
          eventRender: function(arg) {
            return $('<div class="sup" style="background-color:green">sup g</div>')[0]
          },
          _eventsPositioned: function() {
            expect($('.fc-day-grid .sup').length).toBe(0)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })

      it('can return false and cancel rendering', function(done) {
        var options = {
          eventRender: function(arg) {
            return false
          },
          _eventsPositioned: function() {
            expect($('.fc-day-grid .fc-bgevent').length).toBe(0)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })
    })

    describe('with a timed background event', function() { // not exactly related to eventRender!

      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12T01:00:00',
          rendering: 'background'
        } ]
      })

      it('won\'t render or call eventRender', function(done) {
        var options = {
          eventRender: function(arg) {},
          _eventsPositioned: function() {
            expect($('.fc-day-grid .fc-bgevent').length).toBe(0)
            expect(options.eventRender).not.toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })
    })
  })

  describe('when in week view', function() {

    pushOptions({
      defaultView: 'timeGridWeek'
    })

    describe('with a foreground event', function() {

      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12T01:00:00'
        } ]
      })

      it('can return a new element', function(done) {
        var options = {
          eventRender: function(arg) {
            return $('<div class="fc-event sup" style="background-color:green">sup g</div>')[0]
          },
          _eventsPositioned: function() {
            expect($('.fc-time-grid .sup').length).toBe(1)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })

      it('can return false and cancel rendering', function(done) {
        var options = {
          eventRender: function(arg) {
            return false
          },
          _eventsPositioned: function() {
            expect($('.fc-time-grid .fc-event').length).toBe(0)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })
    })

    describe('with a timed background event', function() {

      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12T01:00:00',
          rendering: 'background'
        } ]
      })

      it('receives correct args AND can modify the element', function(done) {
        var options = {
          eventRender: function(arg) {
            expect(typeof arg.event).toBe('object')
            expect(arg.event.rendering).toBe('background')
            expect(arg.event.start).toBeDefined()
            expect(arg.el instanceof HTMLElement).toBe(true)
            expect(typeof arg.view).toBe('object')
            $(arg.el).css('font-size', '20px')
          },
          _eventsPositioned: function() {
            expect($('.fc-time-grid .fc-bgevent').css('font-size')).toBe('20px')
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })

      it('can return a new element', function(done) {
        var options = {
          eventRender: function() {
            return $('<div class="fc-bgevent sup" style="background-color:green">sup g</div>')[0]
          },
          _eventsPositioned: function() {
            expect($('.fc-time-grid .sup').length).toBe(1)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })

      it('won\'t rendering when returning a new element of the wrong type', function(done) {
        var options = {
          eventRender: function() {
            return $('<p class="fc-bgevent sup" style="background-color:green">sup g</p>')[0]
          },
          _eventsPositioned: function() {
            expect($('.fc-time-grid .sup').length).toBe(0)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })
      it('can return false and cancel rendering', function(done) {
        var options = {
          eventRender: function() {
            return false
          },
          _eventsPositioned: function() {
            expect($('.fc-time-grid .fc-bgevent').length).toBe(0)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })
    })

    describe('with an all-day background event', function() { // not exactly related to eventRender!

      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12',
          rendering: 'background'
        } ]
      })

      it('will render in all-day AND timed slots', function(done) {
        var options = {
          eventRender: function() {},
          _eventsPositioned: function() {
            expect($('.fc-day-grid .fc-bgevent').length).toBe(1)
            expect($('.fc-time-grid .fc-bgevent').length).toBe(1)
            expect(options.eventRender).toHaveBeenCalled()
            done()
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        initCalendar(options)
      })
    })
  })
})
