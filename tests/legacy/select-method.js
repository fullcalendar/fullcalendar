describe('select method', function() {

  var options

  beforeEach(function() {
    affix('#cal')
    options = {
      defaultDate: '2014-05-25',
      selectable: true
    }
  })

  afterEach(function() {
    $('#cal').fullCalendar('destroy')
  });

  /*
  THINGS TO IMPLEMENT IN SRC (in addition to notes further down):
  - better date normalization (for both render and reporting to select callback)
    - if second date is the same or before the first
    - if given a mixture of timed/all-day
    - for basic/month views, when given timed dates, should really be all-day
  */

  [ false, true ].forEach(function(isRTL) {
    describe('when isRTL is ' + isRTL, function() {
      beforeEach(function() {
        options.isRTL = isRTL
      })
      describe('when in month view', function() {
        beforeEach(function() {
          options.defaultView = 'month'
        })
        describe('when called with all-day moments', function() {
          describe('when in bounds', function() {
            it('renders a selection', function() {
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2014-05-07', '2014-05-09')
              expect($('.fc-highlight')).toBeVisible()
            })
            it('renders a selection when called with one argument', function() {
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2014-05-07')
              expect($('.fc-highlight')).toBeVisible()
            })
            it('fires a selection event', function() {
              options.select = function(start, end) {
                expect(start.hasTime()).toEqual(false)
                expect(end.hasTime()).toEqual(false)
                expect(start).toEqualMoment('2014-05-07')
                expect(end).toEqualMoment('2014-05-09')
              }
              spyOn(options, 'select').and.callThrough()
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2014-05-07', '2014-05-09')
              expect(options.select).toHaveBeenCalled()
            })
          })
          describe('when out of bounds', function() {
            it('doesn\'t render a selection', function() {
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2015-05-07', '2015-05-09')
              expect($('.fc-highlight')).not.toBeVisible()
            })
            /*
            TODO: implement this behavior
            it('doesn\'t fire a selection event', function() {
              options.select = function(start, end) {
                expect(start).toEqualMoment('2014-05-07');
                expect(end).toEqualMoment('2014-05-09');
              };
              spyOn(options, 'select').and.callThrough();
              $('#cal').fullCalendar(options);
              $('#cal').fullCalendar('select', '2015-05-07', '2015-05-09');
              expect(options.select).not.toHaveBeenCalled();
            });
            */
          })
        })
        describe('when called with timed moments', function() {
          it('renders a selection', function() {
            $('#cal').fullCalendar(options)
            $('#cal').fullCalendar('select', '2014-05-07T06:00:00', '2014-05-09T07:00:00')
            expect($('.fc-highlight')).toBeVisible()
          })
          it('fires a selection event', function() {
            options.select = function(start, end) {
              expect(start.hasTime()).toEqual(true)
              expect(end.hasTime()).toEqual(true)
              expect(start).toEqualMoment('2014-05-07T06:00:00')
              expect(end).toEqualMoment('2014-05-09T06:00:00')
            }
            spyOn(options, 'select').and.callThrough()
            $('#cal').fullCalendar(options)
            $('#cal').fullCalendar('select', '2014-05-07T06:00:00', '2014-05-09T06:00:00')
            expect(options.select).toHaveBeenCalled()
          })
        })
      })
      describe('when in agendaWeek view', function() { // May 25 - 31
        beforeEach(function() {
          options.defaultView = 'agendaWeek'
          options.scrollTime = '01:00:00' // so that most events will be below the divider
          options.height = 400 // short enought to make scrolling happen
        })
        describe('when called with timed moments', function() {
          describe('when in bounds', function() {
            it('renders a selection when called with one argument', function() {
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2014-05-26T06:00:00')
              expect($('.fc-highlight')).toBeVisible()
            })
            it('renders a selection over the slot area', function() {
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2014-05-26T06:00:00', '2014-05-26T08:00:00')
              expect($('.fc-highlight')).toBeVisible()
              var slotAreaTop = $('.fc-time-grid-container').offset().top
              var overlayTop = $('.fc-highlight').offset().top
              expect(overlayTop).toBeGreaterThan(slotAreaTop)
            })
          })
          describe('when out of bounds', function() {
            it('doesn\'t render a selection', function() {
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2015-05-26T06:00:00', '2015-05-26T07:00:00')
              expect($('.fc-highlight')).not.toBeVisible()
            })
            /*
            TODO: implement this behavior
            it('doesn\'t fire a selection event', function() {
              options.select = function(start, end) {
                expect(start).toEqualMoment('2015-05-07T06:00:00');
                expect(end).toEqualMoment('2015-05-09T07:00:00');
              };
              spyOn(options, 'select').and.callThrough();
              $('#cal').fullCalendar(options);
              $('#cal').fullCalendar('select', '2015-05-07T06:00:00', '2015-05-09T07:00:00');
              expect(options.select).not.toHaveBeenCalled();
            });
            */
          })
        })
        describe('when called with all-day moments', function() { // forget about in/out bounds for this :)
          describe('when allDaySlot is on', function() {
            beforeEach(function() {
              options.allDaySlot = true
            })
            it('renders a selection over the day area', function() {
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2014-05-26', '2014-05-28')
              expect($('.fc-highlight')).toBeVisible()
              var slotAreaTop = $('.fc-time-grid-container').offset().top
              var overlayTop = $('.fc-highlight').offset().top
              expect(overlayTop).toBeLessThan(slotAreaTop)
            })
            it('fires a selection event', function() {
              options.select = function(start, end) {
                expect(start.hasTime()).toEqual(false)
                expect(end.hasTime()).toEqual(false)
                expect(start).toEqualMoment('2014-05-26')
                expect(end).toEqualMoment('2014-05-28')
              }
              spyOn(options, 'select').and.callThrough()
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2014-05-26', '2014-05-28')
              expect(options.select).toHaveBeenCalled()
            })
          })
          describe('when allDaySlot is off', function() {
            beforeEach(function() {
              options.allDaySlot = false
            })
            it('doesn\'t render', function() {
              $('#cal').fullCalendar(options)
              $('#cal').fullCalendar('select', '2014-05-26', '2014-05-28')
              expect($('.fc-highlight')).not.toBeVisible()
            })
            /*
            TODO: implement
            it('doesn\'t fire a selection event', function() {
              options.select = function(start, end) {
                expect(start.hasTime()).toEqual(false);
                expect(end.hasTime()).toEqual(false);
                expect(start).toEqualMoment('2014-05-26');
                expect(end).toEqualMoment('2014-05-28');
              };
              spyOn(options, 'select').and.callThrough();
              $('#cal').fullCalendar(options);
              $('#cal').fullCalendar('select', '2014-05-26', '2014-05-28');
              expect(options.select).not.toHaveBeenCalled();
            });
            */
          })
        })
      })
    })
  })
})
