import bootstrapPlugin from '@fullcalendar/bootstrap'
import dayGridPlugin from '@fullcalendar/daygrid'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('buttonIcons', function() {
  pushOptions({
    plugins: [ dayGridPlugin, bootstrapPlugin ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'prevYear, nextYear'
    }
  })

  describe('when buttonIcons is not set', function() {

    it('should have default values', function() {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      let prevBtn = toolbarWrapper.getButtonInfo('prev')
      let nextBtn = toolbarWrapper.getButtonInfo('next')
      let nextYearBtn = toolbarWrapper.getButtonInfo('nextYear')
      let prevYearBtn = toolbarWrapper.getButtonInfo('prevYear')

      expect(prevBtn.iconName).toBe('chevron-left')
      expect(nextBtn.iconName).toBe('chevron-right')
      expect(nextYearBtn.iconName).toBe('chevrons-right')
      expect(prevYearBtn.iconName).toBe('chevrons-left')
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
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      let prevBtn = toolbarWrapper.getButtonInfo('prev')
      let nextYearBtn = toolbarWrapper.getButtonInfo('nextYear')
      let prevYearBtn = toolbarWrapper.getButtonInfo('prevYear')

      expect(prevBtn.iconName).toBe('some-icon-left')
      expect(prevBtn.iconName).toBe('some-icon-left')
      expect(prevYearBtn.iconName).toBe('some-icon-leftYear')
      expect(nextYearBtn.iconName).toBe('some-icon-rightYear')
    })
  })

  describe('when theme is set', function() {
    pushOptions({
      themeSystem: 'bootstrap'
    })

    it('buttonIcons is ignored', function() {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let prevButtonInfo = toolbarWrapper.getButtonInfo('prev') // NOT called with 'fa'

      expect(prevButtonInfo.iconName).toBeFalsy()
    })
  })
})
