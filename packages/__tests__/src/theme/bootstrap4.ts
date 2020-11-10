import bootstrapPlugin from '@fullcalendar/bootstrap'
import dayGridPlugin from '@fullcalendar/daygrid'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('bootstrap theme', () => {
  pushOptions({
    plugins: [bootstrapPlugin, dayGridPlugin],
    themeSystem: 'bootstrap',
  })

  describe('fa', () => {
    pushOptions({
      headerToolbar: { left: '', center: '', right: 'next' },
    })

    it('renders default', () => {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('next', 'fa')

      expect(buttonInfo.iconName).toBe('chevron-right')
    })

    it('renders a customized icon', () => {
      let calendar = initCalendar({
        bootstrapFontAwesome: {
          next: 'asdf',
        },
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      let buttonInfo = toolbarWrapper.getButtonInfo('next', 'fa')

      expect(buttonInfo.iconName).toBe('asdf')
    })

    it('renders text when specified as false', () => {
      let calendar = initCalendar({
        bootstrapFontAwesome: false,
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      expect(toolbarWrapper.getButtonInfo('next', 'fa').iconName).toBeFalsy()
    })
  })
})
