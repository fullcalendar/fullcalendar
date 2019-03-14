import BootstrapPlugin from '@fullcalendar/bootstrap'
import DayGridPlugin from '@fullcalendar/daygrid'

describe('buttonIcons', function() {
  pushOptions({
    plugins: [ DayGridPlugin, BootstrapPlugin ],
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'prevYear, nextYear'
    }
  })

  describe('when buttonIcons is not set', function() {

    it('should have default values', function() {
      initCalendar()
      var $cal = $(currentCalendar.el)
      var prevBtn = $cal.find('.fc-prev-button')
      var nextBtn = $cal.find('.fc-next-button')
      var nextYearBtn = $cal.find('.fc-nextYear-button')
      var prevYearBtn = $cal.find('.fc-prevYear-button')

      expect(prevBtn.find('span:first')).toHaveClass('fc-icon-chevron-left')
      expect(nextBtn.find('span:first')).toHaveClass('fc-icon-chevron-right')
      expect(nextYearBtn.find('span:first')).toHaveClass('fc-icon-chevrons-right')
      expect(prevYearBtn.find('span:first')).toHaveClass('fc-icon-chevrons-left')
    })
  })

  describe('when buttonIcons is set and theme is falsy', function() {

    pushOptions({
      buttonIcons: {
        prev: 'some-icon-left',
        next: 'some-icon-right',
        prevYear: 'some-icon-leftYear',
        nextYear: 'some-icon-rightYear'
      }
    })

    it('should have the set values', function() {
      initCalendar()
      var $cal = $(currentCalendar.el)
      var prevBtn = $cal.find('.fc-prev-button')
      var prevYearBtn = $cal.find('.fc-prevYear-button')
      var nextYearBtn = $cal.find('.fc-nextYear-button')

      expect(prevBtn.find('span:first')).toHaveClass('fc-icon-some-icon-left')
      expect(prevBtn.find('span:first')).toHaveClass('fc-icon-some-icon-left')
      expect(prevYearBtn.find('span:first')).toHaveClass('fc-icon-some-icon-leftYear')
      expect(nextYearBtn.find('span:first')).toHaveClass('fc-icon-some-icon-rightYear')
    })
  })

  describe('when theme is set', function() {

    pushOptions({
      themeSystem: 'bootstrap'
    })

    it('buttonIcons is ignored', function() {
      initCalendar()
      var $cal = $(currentCalendar.el)
      var classesToSearch = [ '.fc-icon-chevron-left', '.fc-icon-chevrons-right',
        '.fc-icon-chevron-right', '.fc-icon-chevrons-left' ]

      for (var i = 0; i < classesToSearch.length; i++) {
        var cls = classesToSearch[i]
        expect($cal.find(cls).length).toBe(0)
      };
    })
  })
})
