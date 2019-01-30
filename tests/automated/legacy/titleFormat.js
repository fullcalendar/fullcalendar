describe('titleFormat', function() {

  var SELECTOR = '.fc-toolbar h2'

  describe('when default', function() {

    var viewWithFormat = [
      { view: 'month', expected: 'June 2014' },
      { view: 'dayGridWeek', expected: /Jun 8 - 14,? 2014/ },
      { view: 'week', expected: /Jun 8 - 14,? 2014/ },
      { view: 'dayGridDay', expected: /June 12,? 2014/ },
      { view: 'day', expected: /June 12,? 2014/ }
    ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-06-12',
        titleRangeSeparator: ' - '
      })
    })

    it('should have default values', function() {
      var cal = $(currentCalendar.el)

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect(cal.find(SELECTOR).text()).toMatch(crtView.expected)
      };
    })
  })

  describe('when set on a per-view basis', function() {

    var viewWithFormat = [
      { view: 'month', expected: 'June 2014' },
      { view: 'dayGridWeek', expected: 'Jun 8 - 14, 2014' },
      { view: 'week', expected: 'June 8 - 14, 2014' },
      { view: 'dayGridDay', expected: 'Thursday, June 12, 2014' }
    ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-06-12',
        titleRangeSeparator: ' - ',
        views: {
          month: { titleFormat: { year: 'numeric', month: 'long' } },
          dayGridWeek: { titleFormat: { day: 'numeric', month: 'short', year: 'numeric' } },
          week: { titleFormat: { day: 'numeric', month: 'long', year: 'numeric' } },
          dayGridDay: { titleFormat: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } }
        }
      })
    })

    it('should have the correct values', function() {
      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect($(currentCalendar.el).find(SELECTOR).text()).toBe(crtView.expected)
      };
    })
  })

  describe('when default and locale is French', function() {

    var viewWithFormat = [
      { view: 'month', expected: 'juin 2014' },
      { view: 'dayGridWeek', expected: '9 - 15 juin 2014' },
      { view: 'week', expected: '9 - 15 juin 2014' },
      { view: 'dayGridDay', expected: '12 juin 2014' },
      { view: 'day', expected: '12 juin 2014' }
    ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-06-12',
        titleRangeSeparator: ' - ',
        locale: 'fr'
      })
    })

    it('should have the translated dates', function() {
      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect($(currentCalendar.el).find(SELECTOR).text()).toBe(crtView.expected)
      };
    })
  })

  describe('using custom views', function() {

    it('multi-year default only displays year', function() {
      initCalendar({
        views: {
          multiYear: {
            type: 'dayGrid',
            duration: { years: 2 }
          }
        },
        defaultView: 'multiYear',
        defaultDate: '2014-12-25',
        titleRangeSeparator: ' - '
      })
      expect($('h2')).toHaveText('2014 - 2015')
    })

    it('multi-month default only displays month/year', function() {
      initCalendar({
        views: {
          multiMonth: {
            type: 'dayGrid',
            duration: { months: 2 }
          }
        },
        defaultView: 'multiMonth',
        defaultDate: '2014-12-25',
        titleRangeSeparator: ' - '
      })
      expect($('h2')).toHaveText('December 2014 - January 2015')
    })

    it('multi-week default displays short full date', function() {
      initCalendar({
        views: {
          multiWeek: {
            type: 'dayGrid',
            duration: { weeks: 2 }
          }
        },
        defaultView: 'multiWeek',
        defaultDate: '2014-12-25',
        titleRangeSeparator: ' - '
      })
      expect($('h2').text()).toMatch(/Dec 21,? 2014 - Jan 3,? 2015/)
    })

    it('multi-day default displays short full date', function() {
      initCalendar({
        views: {
          multiDay: {
            type: 'dayGrid',
            duration: { days: 2 }
          }
        },
        defaultView: 'multiDay',
        defaultDate: '2014-12-25',
        titleRangeSeparator: ' - '
      })
      expect($('h2').text()).toMatch(/Dec 25 - 26,? 2014/)
    })
  })

  describe('when not all days are shown', function() {

    it('doesn\'t include hidden days in the title', function() {
      initCalendar({
        defaultView: 'week',
        defaultDate: '2017-02-13',
        weekends: false,
        titleRangeSeparator: ' - '
      })
      expect($('h2')).toHaveText('Feb 13 - 17, 2017') // does not include Sunday
    })
  })
})
