import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import dayGridPlugin from 'fullcalendar/daygrid'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('buttons', () => {
  pushOptions({
    plugins: [classicThemePlugin, themeForTestsPlugin, dayGridPlugin],
  })

  it('can specify text', () => {
    let calendar = initCalendar({
      buttons: {
        mybutton: { text: 'asdf' },
      },
      headerToolbar: { left: 'mybutton', center: '', right: '' },
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    let buttonInfo = toolbarWrapper.getButtonInfo('mybutton')
    expect(buttonInfo.text).toBe('asdf')
  })

  /*
  TODO: tests for icon replacement (iconClass/iconContent?)
  */
})
