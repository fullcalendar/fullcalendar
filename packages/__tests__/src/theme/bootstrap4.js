import BootstrapPlugin from '@fullcalendar/bootstrap'
import DayGridPlugin from '@fullcalendar/daygrid'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'

describe('bootstrap theme', function() {
  pushOptions({
    plugins: [ BootstrapPlugin, DayGridPlugin ],
    themeSystem: 'bootstrap'
  })

  describe('fa', function() {
    pushOptions({
      header: { left: '', center: '', right: 'next' }
    })

    it('renders default', function() {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('next', 'fa')

      expect(buttonInfo.iconName).toBe('chevron-right')
    })

    it('renders a customized icon', function() {
      let calendar = initCalendar({
        bootstrapFontAwesome: {
          next: 'asdf'
        }
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('next', 'fa')

      expect(buttonInfo.iconName).toBe('asdf')
    })

    it('renders text when specified as false', function() {
      let calendar = initCalendar({
        bootstrapFontAwesome: false
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      expect(toolbarWrapper.getButtonInfo('next', 'fa').iconName).toBeFalsy()
    })
  })
})
