import BootstrapPlugin from '@fullcalendar/bootstrap'
import DayGridPlugin from '@fullcalendar/daygrid'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'

describe('customButtons', function() {
  pushOptions({
    plugins: [ BootstrapPlugin, DayGridPlugin ]
  })

  it('can specify text', function() {
    let calendar = initCalendar({
      customButtons: {
        mybutton: { text: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    let buttonInfo = toolbarWrapper.getCustomButtonInfo('mybutton')
    expect(buttonInfo.text).toBe('asdf')
  })

  it('can specify an icon', function() {
    let calendar = initCalendar({
      customButtons: {
        mybutton: { icon: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    let buttonInfo = toolbarWrapper.getCustomButtonInfo('mybutton')
    expect(buttonInfo.iconName).toBe('asdf')
  })

  it('can specify a bootstrap font-awesome icon', function() {
    let calendar = initCalendar({
      themeSystem: 'bootstrap',
      customButtons: {
        mybutton: { bootstrapFontAwesome: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    let buttonInfo = toolbarWrapper.getCustomButtonInfo('mybutton', 'fa')
    expect(buttonInfo.iconName).toBe('asdf')
  })

})
