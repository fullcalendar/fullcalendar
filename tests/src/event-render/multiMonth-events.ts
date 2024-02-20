import { filterVisibleEls } from '../lib/dom-misc.js'
import { MultiMonthViewWrapper } from '../lib/wrappers/MultiMonthViewWrapper.js'

describe('multi-month-view event rendering', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/7573
  it('will not incorrectly put events under +more link', () => {
    const calendarEl = document.createElement('div')
    calendarEl.style.width = '1200px'
    calendarEl.style.maxWidth = '1200px'
    document.body.appendChild(calendarEl)

    const calendar = initCalendar({
      initialView: 'multiMonthYear',
      initialDate: '2024-01-15',
      multiMonthMaxColumns: 2,
      events: [
        {
          title: 'event 1',
          start: '2024-01-15',
          end: '2024-01-20',
        },
        {
          title: 'event 2',
          start: '2024-01-15',
          end: '2024-01-20',
        },
        {
          title: 'event 3',
          start: '2024-01-15',
        },
      ],
    }, calendarEl)

    const viewWrapper = new MultiMonthViewWrapper(calendar)
    const dayGridWrapper = viewWrapper.getDayGrid(0)
    const visibleEventEls = filterVisibleEls(dayGridWrapper.getEventEls())
    const moreEls = dayGridWrapper.getMoreEls()
    const moreTexts = moreEls.map((moreEl) => moreEl.innerText)

    expect(visibleEventEls.length).toBe(2)
    expect(moreTexts).toEqual(['+2 more'])

    document.body.removeChild(calendarEl)
  })
})
