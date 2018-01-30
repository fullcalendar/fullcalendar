describe('viewRender', function() {

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

    it('fires after the view is rendered, with correct arguments', function(done) {
      initCalendar({
        viewRender: function(givenViewObj, givenViewEl) {
          var viewObj = currentCalendar.getView()
          var viewEl = $('.fc-view', currentCalendar.el)

          expect(viewObj).toBe(givenViewObj)
          expect(viewEl[0]).toBe(givenViewEl[0])
          expect(viewEl.children().length >= 1).toBe(true) // has it rendered content?
          done()
        }
      })
    })
  }
})
