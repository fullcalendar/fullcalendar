describe('datesDestroy', function() {

  pushOptions({
    defaultDate: '2015-02-20'
  })

  describe('when in month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth'
    })
    defineTests()
  })

  describe('when in week view', function() {
    pushOptions({
      defaultView: 'timeGridWeek'
    })
    defineTests()
  })

  function defineTests() {
    it('fires before the view is unrendered, with correct arguments', function(done) {
      var datesRenderCalls = 0
      var datesDestroyCalls = 0
      initCalendar({
        datesRender: function() {
          ++datesRenderCalls
        },
        datesDestroy: function(arg) {
          if (++datesDestroyCalls === 1) { // because done() calls destroy

            // the datesDestroy should be called before the next datesRender
            expect(datesRenderCalls).toBe(1)

            var viewObj = currentCalendar.view
            var viewEl = $('.fc-view', currentCalendar.el)

            expect(viewObj).toBe(arg.view)
            expect(viewEl[0]).toBe(arg.el)
            expect(viewEl.children().length >= 1).toBe(true) // is the content still rendered?
            done()
          }
        }
      })
      currentCalendar.next() // trigger datesDestroy/datesRender
    })
  }
})
