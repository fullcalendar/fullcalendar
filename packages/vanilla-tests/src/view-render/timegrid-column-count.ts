import { Calendar } from 'fullcalendar'

describe('timeGrid accessible column count', () => {
  pushOptions({
    initialDate: '2026-10-12',
  })

  function expectColumnCount(calendar: Calendar, count: number) {
    let table = calendar.el.querySelector('[role=table]')
    expect(Number(table.getAttribute('aria-colcount'))).toBe(count)

    let rows = table.querySelectorAll('[role=row]')
    expect(rows.length).toBeGreaterThan(0)
    for (let row of Array.from(rows) as Element[]) {
      let cells = Array.from(row.querySelectorAll('[role=cell], [role=columnheader], [role=rowheader]'))
        .filter((cell) => cell.closest('[role=row]') === row)
      let colCount = cells.reduce((total, cell) => total + Number(cell.getAttribute('aria-colspan') || 1), 0)
      expect(colCount).toBe(count)
    }
  }

  it('counts the axis alongside all seven days', () => {
    expectColumnCount(initCalendar({ initialView: 'timeGridWeek' }), 8)
  })

  it('counts the axis alongside a single day', () => {
    expectColumnCount(initCalendar({ initialView: 'timeGridDay' }), 2)
  })

  it('counts only visible days plus the axis', () => {
    expectColumnCount(initCalendar({ initialView: 'timeGridWeek', weekends: false }), 6)
  })

  it('retains the axis when headers and all-day slots are disabled', () => {
    expectColumnCount(initCalendar({
      initialView: 'timeGridWeek', dayHeaders: false, allDaySlot: false,
    }), 8)
  })

  it('counts the week-number corner as the axis column in RTL', () => {
    expectColumnCount(initCalendar({
      initialView: 'timeGridWeek', weekNumbers: true, direction: 'rtl',
    }), 8)
  })

  it('updates the count when switching views and changing visible days', () => {
    let calendar = initCalendar({ initialView: 'timeGridWeek' })
    expectColumnCount(calendar, 8)
    calendar.changeView('timeGridDay')
    expectColumnCount(calendar, 2)
    calendar.changeView('dayGridWeek')
    expectColumnCount(calendar, 7)
    calendar.changeView('timeGridWeek')
    calendar.setOption('weekends', false)
    expectColumnCount(calendar, 6)
  })
})
