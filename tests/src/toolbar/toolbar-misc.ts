import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

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

  it('if disabled, won\'t put aria-labelledby on view container', () => {
    let calendar = initCalendar({
      headerToolbar: false,
    })

    const calendarWrapper = new CalendarWrapper(calendar)
    const viewContainerEl = calendarWrapper.getViewContainerEl()

    expect(viewContainerEl).not.toHaveAttr('aria-labelledby')
  })
})
