
describe('event fetching while date-navigating', function() {

  // https://github.com/fullcalendar/fullcalendar/issues/4975
  it('renders events when doing next() and then prev()', function(done) {

    initCalendar({
      defaultView: 'dayGridMonth',
      defaultDate: '2020-02-11',
      events: function(arg, callback) {
        if (arg.startStr.indexOf('2020-01-26') === 0) { // for Feb
          setTimeout(function() {
            callback([
              { start: '2020-02-15' } // middle of month
            ])
          }, 100)
        } else if (arg.startStr.indexOf('2020-03-01') === 0) { // for March
          setTimeout(function() {
            callback([
              { start: '2020-03-15' } // middle of month
            ])
          }, 100)
        } else {
          throw new Error('bad range')
        }
      }
    })

    setTimeout(function() {

      currentCalendar.next()
      setTimeout(function() {

        currentCalendar.prev()
        setTimeout(function() {

          expect($('.fc-event').length).toBe(1)
          done()

        }, 1000) // after everything
      }, 50) // before second fetch finishes
    }, 200) // let first fetch finish
  })

})
