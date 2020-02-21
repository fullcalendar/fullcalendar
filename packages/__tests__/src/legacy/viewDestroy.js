import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('datesDestroy', function() {
  pushOptions({
    defaultDate: '2015-02-20'
  })

  describeOptions('defaultView', {
    'when in month view': 'dayGridMonth',
    'when in week view': 'timeGridWeek'
  }, function() {

    it('fires before the view is unrendered, with correct arguments', function(done) {
      let datesRenderCalls = 0
      let datesDestroyCalls = 0

      let calendar = initCalendar({
        datesRender: function() {
          ++datesRenderCalls
        },
        datesDestroy: function(arg) {
          if (++datesDestroyCalls === 1) { // because done() calls destroy

            // the datesDestroy should be called before the next datesRender
            expect(datesRenderCalls).toBe(1)

            let calendarWrapper = new CalendarWrapper(calendar)
            let viewEl = calendarWrapper.getViewEl()

            expect(calendar.view).toBe(arg.view)
            expect(viewEl).toBe(arg.el)
            expect(viewEl.childElementCount).toBeGreaterThanOrEqual(1) // is the content still rendered?
            done()
          }
        }
      })

      calendar.next() // trigger datesDestroy/datesRender
    })

  })
})
