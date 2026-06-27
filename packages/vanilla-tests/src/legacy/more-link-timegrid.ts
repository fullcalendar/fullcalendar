import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { TimeGridWrapper } from '../lib/wrappers/TimeGridWrapper'
import { waitTimeout } from '../lib/misc'

describe('eventMaxStack', () => {
  pushOptions({
    initialView: 'timeGridDay',
    initialDate: '2021-05-07',
    scrollTime: 0,
    eventMaxStack: 2,
  })

  it('puts hidden events in a popover', async () => {
    let calendar = initCalendar({
      events: [
        { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
        { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
        { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' }, // hidden
      ],
    })
    await waitTimeout()
    let timeGrid = new TimeGridViewWrapper(calendar).timeGrid
    let moreLinkEls = timeGrid.getMoreEls()
    expect(moreLinkEls.length).toBe(1)

    timeGrid.openMorePopover()
    await waitTimeout()
    let moreEventEls = timeGrid.getMorePopoverEventEls()
    expect(moreEventEls.length).toBe(1)
  })

  it('can drag events out of popover', async () => {
    let calendar = initCalendar({
      editable: true,
      events: [
        { id: '1', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
        { id: '2', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
        { id: '3', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' }, // hidden
      ],
    })
    await waitTimeout()
    let timeGrid = new TimeGridViewWrapper(calendar).timeGrid
    timeGrid.openMorePopover()
    await waitTimeout()
    let moreEventEls = timeGrid.getMorePopoverEventEls()
    let newStart = '2021-05-07T02:00:00'
    await new Promise<void>((resolve) => {
      $(moreEventEls).simulate('drag', {
        end: timeGrid.getPoint(newStart),
        onRelease() {
          let event = calendar.getEventById('3')
          expect(event.start).toEqualDate(newStart)
          resolve()
        },
      })
    })
  })

  it('causes separate adjacent more links', async () => {
    let calendar = initCalendar({
      events: [
        { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
        { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
        { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' }, // hidden
        { start: '2021-05-07T01:00:00', end: '2021-05-07T02:00:00' },
        { start: '2021-05-07T01:00:00', end: '2021-05-07T02:00:00' },
        { start: '2021-05-07T01:00:00', end: '2021-05-07T02:00:00' }, // hidden
      ],
    })
    await waitTimeout()
    let timeGrid = new TimeGridViewWrapper(calendar).timeGrid
    let moreLinkEls = timeGrid.getMoreEls()
    expect(moreLinkEls.length).toBe(2)
  })

  it('puts overlapping hidden events in same popover, respecting eventOrder', async () => {
    let calendar = initCalendar({
      eventOrder: 'title',
      events: [
        { title: '1', start: '2021-05-07T00:00:00', end: '2021-05-07T02:00:00' },
        { title: '2', start: '2021-05-07T00:00:00', end: '2021-05-07T02:00:00' },
        { title: '3', start: '2021-05-07T01:00:00', end: '2021-05-07T03:00:00' }, // hidden
        { title: '4', start: '2021-05-07T00:30:00', end: '2021-05-07T02:30:00' }, // hidden
      ],
    })
    await waitTimeout()
    let timeGrid = new TimeGridViewWrapper(calendar).timeGrid
    let moreLinkEls = timeGrid.getMoreEls()
    expect(moreLinkEls.length).toBe(1)

    const canvasCoords = timeGrid.el.getBoundingClientRect()
    const moreLinkCoords = moreLinkEls[0].getBoundingClientRect()
    const moreLinkTop = moreLinkCoords.top - canvasCoords.top
    // TODO: more precise coord matching
    expect(moreLinkTop).toBeGreaterThan(10)

    timeGrid.openMorePopover()
    await waitTimeout()
    let moreEventEls = timeGrid.getMorePopoverEventEls()
    expect(moreEventEls.length).toBe(2)
    expect(TimeGridWrapper.getEventElInfo(moreEventEls[0]).title).toBe('3')
  })
})
