
describe('View object', function() {

  /*
  TODO: move tests from eventLimitClick.js about view.name/type into here
  */

  pushOptions({
    initialDate: '2015-01-01'
  })

  describe('title', function() {

    it('is a correctly defined string', function() {
      initCalendar()
      var view = currentCalendar.view
      expect(view.title).toBe('January 2015')
    })

    it('is available in the viewDidMount callback', function() {
      var viewDidMountSpy = spyOnCalendarCallback('viewDidMount', function(arg) {
        expect(arg.view.title).toBe('January 2015')
      })
      initCalendar()
      expect(viewDidMountSpy).toHaveBeenCalled()
    })

  })

})
