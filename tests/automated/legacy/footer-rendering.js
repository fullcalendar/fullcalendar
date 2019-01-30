describe('footer rendering', function() {

  pushOptions({
    defaultDate: '2014-06-04',
    defaultView: 'week'
  })

  describe('when supplying footer options', function() {
    it('should append a .fc-footer-toolbar to the DOM', function() {
      initCalendar({
        footer: {
          left: 'next,prev',
          center: 'prevYear today nextYear day,week',
          right: 'title'
        }
      })
      var footer = $('#calendar .fc-footer-toolbar')
      expect(footer.length).toBe(1)
    })
  })

  describe('when setting footer to false', function() {
    it('should not have footer table', function() {
      initCalendar({
        footer: false
      })
      expect($('.fc-footer-toolbar')).not.toBeInDOM()
    })
  })

  it('allow for dynamically changing', function() {
    initCalendar({
      footer: {
        left: 'next,prev',
        center: 'prevYear today nextYear day,week',
        right: 'title'
      }
    })
    expect($('.fc-footer-toolbar')).toBeInDOM()
    currentCalendar.setOption('footer', false)
    expect($('.fc-footer-toolbar')).not.toBeInDOM()
  })

})
