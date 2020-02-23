import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('datesRender', function() {
  pushOptions({
    defaultDate: '2015-02-20'
  })

  describeOptions({
    'when in month view': 'dayGridMonth',
    'when in week view': 'timeGridWeek'
  }, function() {

    it('fires after the view is rendered, with correct arguments', function(done) {
      initCalendar({
        datesRender(arg) {
          var viewObj = this.view
          var viewEl = new CalendarWrapper(this).getViewEl()

          expect(viewObj).toBe(arg.view)
          expect(viewEl).toBe(arg.el)
          done()
        }
      })
    })
  })
})
