import bootstrapPlugin from '@fullcalendar/bootstrap'
import timeGridPlugin from '@fullcalendar/timegrid'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('themeSystem', () => {
  pushOptions({
    plugins: [bootstrapPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'next',
    },
  })

  it('can be changed dynamically', () => {
    let calendar = initCalendar()
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    let buttonInfo = toolbarWrapper.getButtonInfo('next')

    expect(calendar.el).toHaveClass(CalendarWrapper.ROOT_CLASSNAME)
    expect(calendar.el).toHaveClass(CalendarWrapper.UNTHEMED_CLASSNAME)
    expect(calendar.el).not.toHaveClass(CalendarWrapper.BOOTSTRAP_CLASSNAME)
    expect(buttonInfo.iconName).toBeTruthy()
    expect($('.table-bordered').length).toBe(0)

    let viewWrapper = new TimeGridViewWrapper(calendar)
    let scrollEl = viewWrapper.getScrollerEl()

    scrollEl.scrollTop = 99999 // scroll all the way down

    // change option!
    calendar.setOption('themeSystem', 'bootstrap')

    buttonInfo = toolbarWrapper.getButtonInfo('next', 'fa')
    expect(calendar.el).toHaveClass(CalendarWrapper.ROOT_CLASSNAME)
    expect(calendar.el).toHaveClass(CalendarWrapper.BOOTSTRAP_CLASSNAME)
    expect(calendar.el).not.toHaveClass(CalendarWrapper.UNTHEMED_CLASSNAME)
    expect(buttonInfo.iconName).toBeTruthy()
    expect($('.table-bordered').length).toBeGreaterThan(0)

    // make sure scrolled down at least just a little bit
    // since we don't have the bootstrap stylesheet loaded, this will be janky
    expect(scrollEl.scrollTop).toBeGreaterThan(10)
  })

  // this tests the options setter with a single hash argument.
  // TODO: not best place for this.
  it('can be change with other options', () => {
    let calendar = initCalendar()

    expect(calendar.el).toHaveClass(CalendarWrapper.ROOT_CLASSNAME)
    expect(calendar.el).toHaveClass(CalendarWrapper.UNTHEMED_CLASSNAME)
    expect(calendar.el).not.toHaveClass(CalendarWrapper.BOOTSTRAP_CLASSNAME)

    // change option!
    calendar.batchRendering(() => {
      calendar.setOption('themeSystem', 'bootstrap')
      calendar.setOption('businessHours', true)
    })

    expect(calendar.el).toHaveClass(CalendarWrapper.ROOT_CLASSNAME)
    expect(calendar.el).toHaveClass(CalendarWrapper.BOOTSTRAP_CLASSNAME)
    expect(calendar.el).not.toHaveClass(CalendarWrapper.UNTHEMED_CLASSNAME)
  })
})
