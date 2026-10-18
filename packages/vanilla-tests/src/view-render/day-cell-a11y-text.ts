import internalClassNames from 'fullcalendar/protected-styles'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('day cell a11y text', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2023-01-16',
  })

  // aria-label on a cell is ignored by VoiceOver when the cell has no other readable content
  it('reads hidden date text instead of a cell label', () => {
    let calendar = initCalendar()
    let cellEl = new DayGridViewWrapper(calendar).dayGrid.getDayEl('2023-01-16')
    let srEls = cellEl.querySelectorAll(`.${internalClassNames.srOnly}`)

    expect(cellEl.hasAttribute('aria-label')).toBe(false)
    expect(srEls.length).toBe(1)
    expect(srEls[0].textContent).toBe('January 16, 2023')
    expect(cellEl.querySelector('.fc-daygrid-day-number').closest('[aria-hidden]')).toBeTruthy()
  })

  it('relies on the nav link instead of hidden text when navLinks enabled', () => {
    let calendar = initCalendar({
      navLinks: true,
    })
    let cellEl = new DayGridViewWrapper(calendar).dayGrid.getDayEl('2023-01-16')

    expect(cellEl.hasAttribute('aria-label')).toBe(false)
    expect(cellEl.querySelector(`.${internalClassNames.srOnly}`)).toBe(null)
    expect(cellEl.querySelector('.fc-navlink').getAttribute('aria-label')).toBe('Go to January 16, 2023')
  })

  // the column header already reads the full date, which would otherwise be read twice
  it('has no hidden date text when cells have no day number', () => {
    let calendar = initCalendar({
      initialView: 'dayGridWeek',
    })
    let cellEl = new DayGridViewWrapper(calendar).dayGrid.getDayEl('2023-01-16')

    expect(cellEl.querySelector(`.${internalClassNames.srOnly}`)).toBe(null)
  })
})
