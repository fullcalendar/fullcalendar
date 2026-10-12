import internalClassNames from 'fullcalendar/protected-styles'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

// screen readers read the visually hidden text. the visible content is aria-hidden
function expectA11yText(headerEl: Element, text: string) {
  let srEls = headerEl.querySelectorAll(`.${internalClassNames.srOnly}`)
  expect(srEls.length).toBe(1)
  expect(srEls[0].textContent).toBe(text)
  expect(headerEl.hasAttribute('aria-label')).toBe(false)

  // the wrapper itself is hidden, otherwise screen readers find an empty group
  for (let childEl of Array.from(headerEl.children)) {
    if (childEl !== srEls[0]) {
      expect(childEl.getAttribute('aria-hidden')).toBe('true')
    }
  }
}

describe('header a11y text', () => {
  pushOptions({
    initialDate: '2020-09-07',
  })

  it('reads the full date for timeGrid date headers', () => {
    let calendar = initCalendar({
      initialView: 'timeGridWeek',
    })
    let headerWrapper = new TimeGridViewWrapper(calendar).header

    expectA11yText(headerWrapper.getCellEl('2020-09-07'), 'September 7, 2020')
  })

  it('reads the full weekday for dayGridMonth day-of-week headers', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
    })
    let headerWrapper = new DayGridViewWrapper(calendar).header

    expectA11yText(headerWrapper.getCellEl(1), 'Monday')
  })

  it('relies on the nav link instead of hidden text when navLinks enabled', () => {
    let calendar = initCalendar({
      initialView: 'timeGridWeek',
      navLinks: true,
    })
    let headerWrapper = new TimeGridViewWrapper(calendar).header
    let cellEl = headerWrapper.getCellEl('2020-09-07')

    expect(cellEl.querySelector(`.${internalClassNames.srOnly}`)).toBe(null)
    expect(cellEl.hasAttribute('aria-label')).toBe(false)
    expect(cellEl.querySelector('.fc-navlink').getAttribute('aria-label')).toBe('September 7, 2020') // no verb
  })

  it('reads hidden text for the timeGrid timed row header', () => {
    let calendar = initCalendar({
      initialView: 'timeGridWeek',
    })
    let rowHeaderEls = calendar.el.querySelectorAll('[role=rowheader]')
    let timedEl = Array.from(rowHeaderEls).find((el) => (
      el.querySelector(`.${internalClassNames.srOnly}`)
    ))

    expect(timedEl).toBeTruthy()
    expect(timedEl.hasAttribute('aria-label')).toBe(false)
    expect(timedEl.querySelector(`.${internalClassNames.srOnly}`).textContent).toBe('Timed')
  })

  it('reads hidden text for the timeGrid week-number header', () => {
    let calendar = initCalendar({
      initialView: 'timeGridWeek',
      weekNumbers: true,
    })
    let weekEl = calendar.el.querySelector('.fc-timegrid-header [role=columnheader].fc-timegrid-axis')

    expect(weekEl.querySelector(`.${internalClassNames.srOnly}`).textContent).toMatch(/^Week \d+$/)
    expectA11yText(weekEl, weekEl.querySelector(`.${internalClassNames.srOnly}`).textContent)
  })

  it('relies on the nav link for the timeGrid week-number header when navLinks enabled', () => {
    let calendar = initCalendar({
      initialView: 'timeGridDay',
      weekNumbers: true,
      navLinks: true,
    })
    let weekEl = calendar.el.querySelector('.fc-timegrid-header [role=columnheader].fc-timegrid-axis')

    expect(weekEl.querySelector(`.${internalClassNames.srOnly}`)).toBe(null)
    expect(weekEl.hasAttribute('aria-label')).toBe(false)
    expect(weekEl.querySelector('.fc-navlink').getAttribute('aria-label')).toMatch(/^Week \d+$/) // no verb
  })
})
