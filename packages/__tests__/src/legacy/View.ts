describe('View object', () => {
  /*
  TODO: move tests from eventLimitClick.js about view.name/type into here
  */

  pushOptions({
    initialDate: '2015-01-01',
  })

  describe('title', () => {
    it('is a correctly defined string', () => {
      initCalendar()
      let view = currentCalendar.view
      expect(view.title).toBe('January 2015')
    })

    it('is available in the viewDidMount callback', () => {
      let viewDidMountSpy = spyOnCalendarCallback('viewDidMount', (arg) => {
        expect(arg.view.title).toBe('January 2015')
      })
      initCalendar()
      expect(viewDidMountSpy).toHaveBeenCalled()
    })
  })
})
