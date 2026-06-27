describe('View object', () => {
  /*
  TODO: move tests from eventLimitClick.js about view.name/type into here
  */

  pushOptions({
    initialDate: '2015-01-01',
  })

  describe('title', () => {
    it('is a correctly defined string', () => {
      let calendar = initCalendar()
      let view = calendar.view
      expect(view.title).toBe('January 2015')
    })

    it('is available in the viewDidMount callback', () => {
      let viewDidMountSpy = spyOnCalendarCallback('viewDidMount', (info) => {
        expect(info.view.title).toBe('January 2015')
      })
      initCalendar()
      expect(viewDidMountSpy).toHaveBeenCalled()
    })
  })
})
