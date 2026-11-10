import { describe, expect, it, vi } from 'vitest'
import { DateUnselectInfo } from 'fullcalendar'
import { appendTestElement, initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { queryParts } from '../lib/models/events'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('unselecting', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-12-25',
    selectable: true,
  }

  function createOtherEl(): HTMLElement {
    const el = appendTestElement(document.createElement('div'))
    el.style.height = '50px'
    return el
  }

  describe('with unselectAuto', () => {
    it.each([
      ['elsewhere in the document', (calendar) => getRectCenter(createOtherEl().getBoundingClientRect())],
      ['on another day', (calendar) => new DayGridModel(calendar.el).pointForDate('2014-12-04')],
    ])('unselects when clicking %s', async (_desc, getClickPoint) => {
      let highlightCntOnUnselect: number | undefined
      const unselect = vi.fn((_info: DateUnselectInfo) => {
        highlightCntOnUnselect = queryParts(calendar.el, 'highlight').length
      })
      const calendar = initCalendar({ ...options, unselectAuto: true, unselect })
      await waitForSettle()

      calendar.select('2014-12-01', '2014-12-03')
      await waitForSettle()
      expect(queryParts(calendar.el, 'highlight').length).toBeGreaterThan(0)

      await pointer.click(getClickPoint(calendar))
      await waitForSettle()

      expect(unselect).toHaveBeenCalledOnce()
      const info = unselect.mock.calls[0][0]
      expect(info.jsEvent).toBeInstanceOf(MouseEvent)
      expect(info.view.type).toBe('dayGridMonth')
      expect(highlightCntOnUnselect).toBe(0)
    })
  })

  it('keeps the selection when clicking elsewhere with unselectAuto:false', async () => {
    const unselect = vi.fn()
    const calendar = initCalendar({ ...options, unselectAuto: false, unselect })
    await waitForSettle()

    calendar.select('2014-12-01', '2014-12-03')
    await waitForSettle()
    await pointer.click(getRectCenter(createOtherEl().getBoundingClientRect()))
    await waitForSettle()

    expect(unselect).not.toHaveBeenCalled()
    expect(queryParts(calendar.el, 'highlight').length).toBeGreaterThan(0)
  })

  it.each([
    ['the dates change', (calendar) => calendar.next(), '2018-09-24', '2018-10-03'],
    ['the view changes', (calendar) => calendar.changeView('dayGridWeek'), '2018-09-09', '2018-09-14'],
  ])('unselects when %s, even if the selection is still in view', (_desc, change, start, end) => {
    const select = vi.fn()
    const unselect = vi.fn()
    const calendar = initCalendar({ ...options, fixedWeekCount: true, now: '2018-09-11', initialDate: undefined, select, unselect })

    calendar.select(start, end)
    expect(select).toHaveBeenCalledOnce()
    expect(unselect).not.toHaveBeenCalled()

    change(calendar)
    expect(unselect).toHaveBeenCalledOnce()
  })
})
