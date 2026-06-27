import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('view height', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/6034
  it('does not squish view-specific height:auto in timegrid view', () => {
    let calendar = initCalendar({
      initialView: 'timeGridWeek',
      aspectRatio: 1.8,
      views: {
        timeGrid: {
          height: 'auto',
        },
      },
    })
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let scrollerEl = viewWrapper.getScrollerEl()

    expect(scrollerEl.getBoundingClientRect().height).toBeGreaterThan(10)
  })
})
