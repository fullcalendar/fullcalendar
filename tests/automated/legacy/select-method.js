describe('select method', function() {

  var options

  beforeEach(function() {
    options = {
      defaultDate: '2014-05-25',
      selectable: true
    }
  });

  /*
  THINGS TO IMPLEMENT IN SRC (in addition to notes further down):
  - better date normalization (for both render and reporting to select callback)
    - if second date is the same or before the first
    - if given a mixture of timed/all-day
    - for dayGrid/month views, when given timed dates, should really be all-day
  */

  [ 'ltr', 'rtl' ].forEach(function(dir) {
    describe('when dir is ' + dir, function() {
      beforeEach(function() {
        options.dir = dir
      })
      describe('when in month view', function() {
        beforeEach(function() {
          options.defaultView = 'dayGridMonth'
        })
        describe('when called with all-day date strings', function() {
          describe('when in bounds', function() {
            it('renders a selection', function() {
              initCalendar(options)
              currentCalendar.select('2014-05-07', '2014-05-09')
              expect($('.fc-highlight')).toBeVisible()
            })
            it('renders a selection when called with one argument', function() {
              initCalendar(options)
              currentCalendar.select('2014-05-07')
              expect($('.fc-highlight')).toBeVisible()
            })
            it('fires a selection event', function() {
              options.select = function(arg) {
                expect(arg.allDay).toEqual(true)
                expect(arg.start).toEqualDate('2014-05-07')
                expect(arg.end).toEqualDate('2014-05-09')
              }
              spyOn(options, 'select').and.callThrough()
              initCalendar(options)
              currentCalendar.select('2014-05-07', '2014-05-09')
              expect(options.select).toHaveBeenCalled()
            })
          })
          describe('when out of bounds', function() {
            it('doesn\'t render a selection', function() {
              initCalendar(options)
              currentCalendar.select('2015-05-07', '2015-05-09')
              expect($('.fc-highlight')).not.toBeVisible()
            })
            /*
            TODO: implement this behavior
            it('doesn\'t fire a selection event', function() {
              options.select = function(arg) {
                expect(arg.start).toEqualDate('2014-05-07');
                expect(arg.end).toEqualDate('2014-05-09');
              };
              spyOn(options, 'select').and.callThrough();
              initCalendar(options);
              currentCalendar.select('2015-05-07', '2015-05-09');
              expect(options.select).not.toHaveBeenCalled();
            });
            */
          })
        })
        describe('when called with timed date strings', function() {
          it('renders a selection', function() {
            initCalendar(options)
            currentCalendar.select('2014-05-07T06:00:00', '2014-05-09T07:00:00')
            expect($('.fc-highlight')).toBeVisible()
          })
          it('fires a selection event', function() {
            options.select = function(arg) {
              expect(arg.allDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-07T06:00:00Z')
              expect(arg.end).toEqualDate('2014-05-09T06:00:00Z')
            }
            spyOn(options, 'select').and.callThrough()
            initCalendar(options)
            currentCalendar.select('2014-05-07T06:00:00', '2014-05-09T06:00:00')
            expect(options.select).toHaveBeenCalled()
          })
        })
      })
      describe('when in week view', function() { // May 25 - 31
        beforeEach(function() {
          options.defaultView = 'timeGridWeek'
          options.scrollTime = '01:00:00' // so that most events will be below the divider
          options.height = 400 // short enought to make scrolling happen
        })
        describe('when called with timed date strings', function() {
          describe('when in bounds', function() {
            it('renders a selection when called with one argument', function() {
              initCalendar(options)
              currentCalendar.select('2014-05-26T06:00:00')
              expect($('.fc-highlight')).toBeVisible()
            })
            it('renders a selection over the slot area', function() {
              initCalendar(options)
              currentCalendar.select('2014-05-26T06:00:00', '2014-05-26T08:00:00')
              expect($('.fc-highlight')).toBeVisible()
              var slotAreaTop = $('.fc-time-grid-container').offset().top
              var overlayTop = $('.fc-highlight').offset().top
              expect(overlayTop).toBeGreaterThan(slotAreaTop)
            })
          })
          describe('when out of bounds', function() {
            it('doesn\'t render a selection', function() {
              initCalendar(options)
              currentCalendar.select('2015-05-26T06:00:00', '2015-05-26T07:00:00')
              expect($('.fc-highlight')).not.toBeVisible()
            })
            /*
            TODO: implement this behavior
            it('doesn\'t fire a selection event', function() {
              options.select = function(arg) {
                expect(arg.start).toEqualDate('2015-05-07T06:00:00Z');
                expect(arg.end).toEqualDate('2015-05-09T07:00:00Z');
              };
              spyOn(options, 'select').and.callThrough();
              initCalendar(options);
              currentCalendar.select('2015-05-07T06:00:00', '2015-05-09T07:00:00');
              expect(options.select).not.toHaveBeenCalled();
            });
            */
          })
        })
        describe('when called with all-day date strings', function() { // forget about in/out bounds for this :)
          describe('when allDaySlot is on', function() {
            beforeEach(function() {
              options.allDaySlot = true
            })
            it('renders a selection over the day area', function() {
              initCalendar(options)
              currentCalendar.select('2014-05-26', '2014-05-28')
              expect($('.fc-highlight')).toBeVisible()
              var slotAreaTop = $('.fc-time-grid-container').offset().top
              var overlayTop = $('.fc-highlight').offset().top
              expect(overlayTop).toBeLessThan(slotAreaTop)
            })
            it('fires a selection event', function() {
              options.select = function(arg) {
                expect(arg.allDay).toEqual(true)
                expect(arg.start).toEqualDate('2014-05-26')
                expect(arg.end).toEqualDate('2014-05-28')
              }
              spyOn(options, 'select').and.callThrough()
              initCalendar(options)
              currentCalendar.select('2014-05-26', '2014-05-28')
              expect(options.select).toHaveBeenCalled()
            })
          })
          describe('when allDaySlot is off', function() {
            beforeEach(function() {
              options.allDaySlot = false
            })
            it('doesn\'t render', function() {
              initCalendar(options)
              currentCalendar.select('2014-05-26', '2014-05-28')
              expect($('.fc-highlight')).not.toBeVisible()
            })
            /*
            TODO: implement
            it('doesn\'t fire a selection event', function() {
              options.select = function(arg) {
                expect(arg.allDay).toEqual(true);
                expect(arg.start).toEqualDate('2014-05-26');
                expect(arg.end).toEqualDate('2014-05-28');
              };
              spyOn(options, 'select').and.callThrough();
              initCalendar(options);
              currentCalendar.select('2014-05-26', '2014-05-28');
              expect(options.select).not.toHaveBeenCalled();
            });
            */
          })
        })
      })
    })
  })
})
