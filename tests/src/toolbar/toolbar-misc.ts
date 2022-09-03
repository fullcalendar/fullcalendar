import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('toolbar rendering', () => {
  it('produces type="button" attributes', () => {
    let calendar = initCalendar({
      headerToolbar: {
        left: 'today',
        center: 'title',
        right: 'prev,next',
      },
    })

    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    let todayButtonEl = toolbarWrapper.getButtonEl('today')
    let prevButtonEl = toolbarWrapper.getButtonEl('prev')

    expect(todayButtonEl.getAttribute('type')).toBe('button')
    expect(prevButtonEl.getAttribute('type')).toBe('button')
  })
})
