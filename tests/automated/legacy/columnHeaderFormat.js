
describe('columnHeaderFormat', function() {

  describe('when columnFormat is not set', function() {

    var viewWithFormat = [ { view: 'month', expected: 'Sun', selector: 'th.fc-day-header.fc-sun' },
      { view: 'basicWeek', expected: 'Sun 5/11', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaWeek', expected: 'Sun 5/11', selector: 'th.fc-widget-header.fc-sun' },
      { view: 'basicDay', expected: 'Sunday', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaDay', expected: 'Sunday', selector: 'th.fc-widget-header.fc-sun' } ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11'
      })
    })

    it('should have default values', function() {

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect(currentCalendar.el.find(crtView.selector).text()).toBe(crtView.expected)
      };
    })
  })

  describe('when columnHeaderFormat is set on a per-view basis', function() {

    var viewWithFormat = [ { view: 'month', expected: 'Sunday', selector: 'th.fc-day-header.fc-sun' },
      { view: 'basicWeek', expected: 'Sunday 11 - 5', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaWeek', expected: 'Sunday 11 , 5', selector: 'th.fc-widget-header.fc-sun' },
      { view: 'basicDay', expected: 'Sunday 11 | 5', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaDay', expected: 'Sunday 5/11', selector: 'th.fc-widget-header.fc-sun' } ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11',
        views: {
          month: { columnHeaderFormat: 'dddd' },
          agendaDay: { columnHeaderFormat: 'dddd M/D' },
          agendaWeek: { columnHeaderFormat: 'dddd D , M' },
          basicDay: { columnHeaderFormat: 'dddd D | M' },
          basicWeek: { columnHeaderFormat: 'dddd D - M' }
        }
      })
    })

    it('should have the correct values', function() {

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect(currentCalendar.el.find(crtView.selector).text()).toBe(crtView.expected)
      };
    })
  })

  describe('when locale is French', function() {

    var viewWithFormat = [ { view: 'month', expected: 'dim.', selector: 'th.fc-day-header.fc-sun' },
      { view: 'basicWeek', expected: 'dim. 11/5', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaWeek', expected: 'dim. 11/5', selector: 'th.fc-widget-header.fc-sun' },
      { view: 'basicDay', expected: 'dimanche', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaDay', expected: 'dimanche', selector: 'th.fc-widget-header.fc-sun' } ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11',
        locale: 'fr'
      })
    })

    it('should have the translated dates', function() {

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect(currentCalendar.el.find(crtView.selector).text()).toBe(crtView.expected)
      };
    })
  })

  describe('when locale is en-gb', function() {

    var viewWithFormat = [ { view: 'month', expected: 'Sun', selector: 'th.fc-day-header.fc-sun' },
      { view: 'basicWeek', expected: 'Sun 11/5', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaWeek', expected: 'Sun 11/5', selector: 'th.fc-widget-header.fc-sun' },
      { view: 'basicDay', expected: 'Sunday', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaDay', expected: 'Sunday', selector: 'th.fc-widget-header.fc-sun' } ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11',
        locale: 'en-gb'
      })
    })

    it('should have the translated dates', function() {

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect(currentCalendar.el.find(crtView.selector).text()).toBe(crtView.expected)
      };
    })
  })

  describe('when locale is Korean', function() {

    var viewWithFormat = [ { view: 'month', expected: '일', selector: 'th.fc-day-header.fc-sun' },
      { view: 'basicWeek', expected: '일 05.11.', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaWeek', expected: '일 05.11.', selector: 'th.fc-widget-header.fc-sun' },
      { view: 'basicDay', expected: '일요일', selector: 'th.fc-day-header.fc-sun' },
      { view: 'agendaDay', expected: '일요일', selector: 'th.fc-widget-header.fc-sun' } ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11',
        locale: 'ko'
      })
    })

    it('should have the translated dates and columnHeaderFormat should be computed differently', function() {
      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect(currentCalendar.el.find(crtView.selector).text()).toBe(crtView.expected)
      };
    })
  })

  describe('using custom views', function() {

    it('multi-year default only displays day-of-week', function() {
      initCalendar({
        views: {
          multiYear: {
            type: 'basic',
            duration: { years: 2 }
          }
        },
        defaultView: 'multiYear',
        defaultDate: '2014-12-25'
      })
      expect($('.fc-day-header:first')).toHaveText('Sun')
    })

    it('multi-month default only displays day-of-week', function() {
      initCalendar({
        views: {
          multiMonth: {
            type: 'basic',
            duration: { months: 2 }
          }
        },
        defaultView: 'multiMonth',
        defaultDate: '2014-12-25'
      })
      expect($('.fc-day-header:first')).toHaveText('Sun')
    })

    it('multi-week default only displays day-of-week', function() {
      initCalendar({
        views: {
          multiWeek: {
            type: 'basic',
            duration: { weeks: 2 }
          }
        },
        defaultView: 'multiWeek',
        defaultDate: '2014-12-25'
      })
      expect($('.fc-day-header:first')).toHaveText('Sun')
    })

    it('multi-day default displays short full date', function() {
      initCalendar({
        views: {
          multiDay: {
            type: 'basic',
            duration: { days: 2 }
          }
        },
        defaultView: 'multiDay',
        defaultDate: '2014-12-25'
      })
      expect($('.fc-day-header:first')).toHaveText('Thu 12/25')
    })
  })
})
