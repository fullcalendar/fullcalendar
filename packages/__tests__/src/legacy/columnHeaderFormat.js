import frLocale from '@fullcalendar/core/locales/fr'
import enGbLocale from '@fullcalendar/core/locales/en-gb'
import koLocale from '@fullcalendar/core/locales/ko'

describe('columnHeaderFormat', function() {

  describe('when not set', function() {

    var viewWithFormat = [
      { view: 'dayGridMonth', expected: /^Sun$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'dayGridWeek', expected: /^Sun 5[/ ]11$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridWeek', expected: /^Sun 5[/ ]11$/, selector: 'th.fc-widget-header.fc-sun' },
      { view: 'dayGridDay', expected: /^Sunday$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridDay', expected: /^Sunday$/, selector: 'th.fc-widget-header.fc-sun' }
    ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11'
      })
    })

    it('should have default values', function() {

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect($(currentCalendar.el).find(crtView.selector).text()).toMatch(crtView.expected)
      };
    })
  })

  describe('when columnHeaderFormat is set on a per-view basis', function() {

    var viewWithFormat = [
      { view: 'dayGridMonth', expected: /^Sunday$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridDay', expected: /^Sunday, May 11$/, selector: 'th.fc-widget-header.fc-sun' },
      { view: 'dayGridWeek', expected: /^Sunday, 5[/ ]11$/, selector: 'th.fc-day-header.fc-sun' }
    ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11',
        views: {
          month: { columnHeaderFormat: { weekday: 'long' } },
          day: { columnHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' } },
          dayGridWeek: { columnHeaderFormat: { weekday: 'long', month: 'numeric', day: 'numeric' } }
        }
      })
    })

    it('should have the correct values', function() {

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect($(currentCalendar.el).find(crtView.selector).text()).toMatch(crtView.expected)
      };
    })
  })

  describe('when locale is French', function() {

    var viewWithFormat = [
      { view: 'dayGridMonth', expected: /^dim\.$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'dayGridWeek', expected: /^dim\. 11[/ ]0?5$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridWeek', expected: /^dim\. 11[/ ]0?5$/, selector: 'th.fc-widget-header.fc-sun' },
      { view: 'dayGridDay', expected: /^dimanche$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridDay', expected: /^dimanche$/, selector: 'th.fc-widget-header.fc-sun' }
    ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11',
        locale: frLocale
      })
    })

    it('should have the translated dates', function() {

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect($(currentCalendar.el).find(crtView.selector).text()).toMatch(crtView.expected)
      };
    })
  })

  describe('when locale is en-gb', function() {

    var viewWithFormat = [
      { view: 'dayGridMonth', expected: /^Sun$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'dayGridWeek', expected: /^Sun 11[/ ]0?5$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridWeek', expected: /^Sun 11[/ ]0?5$/, selector: 'th.fc-widget-header.fc-sun' },
      { view: 'dayGridDay', expected: /^Sunday$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridDay', expected: /^Sunday$/, selector: 'th.fc-widget-header.fc-sun' }
    ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11',
        locale: enGbLocale
      })
    })

    it('should have the translated dates', function() {

      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect($(currentCalendar.el).find(crtView.selector).text()).toMatch(crtView.expected)
      };
    })
  })

  describe('when locale is Korean', function() {

    var viewWithFormat = [
      { view: 'dayGridMonth', expected: /^일$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'dayGridWeek', expected: /^5[.월] 11[.일] \(?일\)?$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridWeek', expected: /^5[.월] 11[.일] \(?일\)?$/, selector: 'th.fc-widget-header.fc-sun' },
      { view: 'dayGridDay', expected: /^일요일$/, selector: 'th.fc-day-header.fc-sun' },
      { view: 'timeGridDay', expected: /^일요일$/, selector: 'th.fc-widget-header.fc-sun' }
    ]

    beforeEach(function() {
      initCalendar({
        defaultDate: '2014-05-11',
        locale: koLocale
      })
    })

    it('should have the translated dates and columnHeaderFormat should be computed differently', function() {
      for (var i = 0; i < viewWithFormat.length; i++) {
        var crtView = viewWithFormat[i]
        currentCalendar.changeView(crtView.view)
        expect($(currentCalendar.el).find(crtView.selector).text()).toMatch(crtView.expected)
      };
    })
  })

  describe('using custom views', function() {

    it('multi-year default only displays day-of-week', function() {
      initCalendar({
        views: {
          multiYear: {
            type: 'dayGrid',
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
            type: 'dayGrid',
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
            type: 'dayGrid',
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
            type: 'dayGrid',
            duration: { days: 2 }
          }
        },
        defaultView: 'multiDay',
        defaultDate: '2014-12-25'
      })
      expect(
        $('.fc-day-header:first').text()
      ).toMatch(/^Thu 12[/ ]25$/)
    })
  })
})
