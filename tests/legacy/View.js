describe('View object', function() {

  /*
  TODO: move tests from eventLimitClick.js about view.name/type into here
  */

  pushOptions({
    defaultDate: '2015-01-01'
  })

  describe('title', function() {

    it('is a correctly defined string', function() {
      initCalendar()
      var view = currentCalendar.getView()
      expect(view.title).toBe('January 2015')
    })

    it('is available in the viewRender callback', function() {
      var viewRenderSpy = spyOnCalendarCallback('viewRender', function(view) {
        expect(view.title).toBe('January 2015')
      })
      initCalendar()
      expect(viewRenderSpy).toHaveBeenCalled()
    })

  })

})
