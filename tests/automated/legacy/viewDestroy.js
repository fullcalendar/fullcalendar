describe('viewDestroy', function() {

  pushOptions({
    defaultDate: '2015-02-20'
  })

  describe('when in month view', function() {
    pushOptions({
      defaultView: 'month'
    })
    defineTests()
  })

  describe('when in agendaWeek view', function() {
    pushOptions({
      defaultView: 'agendaWeek'
    })
    defineTests()
  })

  function defineTests() {
    it('fires before the view is unrendered, with correct arguments', function(done) {
      var viewRenderCalls = 0
      var viewDestroyCalls = 0
      initCalendar({
        viewRender: function() {
          ++viewRenderCalls
        },
        viewDestroy: function(givenViewObj, givenViewEl) {
          if (++viewDestroyCalls === 1) { // because done() calls destroy

            // the viewDestroy should be called before the next viewRender
            expect(viewRenderCalls).toBe(1)

            var viewObj = currentCalendar.getView()
            var viewEl = $('.fc-view', currentCalendar.el)

            expect(viewObj).toBe(givenViewObj)
            expect(viewEl[0]).toBe(givenViewEl[0])
            expect(viewEl.children().length >= 1).toBe(true) // is the content still rendered?
            done()
          }
        }
      })
      currentCalendar.next() // trigger viewDestroy/viewRender
    })
  }
})
