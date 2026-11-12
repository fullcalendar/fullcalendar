import { describe, expect, it, vi } from 'vitest'
import { EventDisplayInfo } from 'fullcalendar'
import { createElement } from 'fullcalendar/preact'
import { initCalendar } from '../lib/calendar'
import { queryPart } from '../lib/models/events'
import { getBgEventEls, getEventTexts, getVisibleEventEls } from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'
import { getParts } from '../lib/parts'

describe('event content hooks', () => {
  describe('eventContent', () => {
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2020-06-01',
      events: [{ title: 'my event', start: '2020-06-01T01:00:00' }],
    }

    function getInnerEl(root: HTMLElement): HTMLElement {
      const eventEls = getVisibleEventEls(root)
      expect(eventEls.length).toBe(1)
      return queryPart(eventEls[0], 'eventInner')!
    }

    it('can return vdom nodes', async () => {
      const calendar = initCalendar({
        ...options,
        eventContent: (info) => createElement(
          'span',
          {},
          createElement('b', {}, info.timeText),
          createElement('i', {}, info.event.title),
        ),
      })
      await waitForSettle()

      expect(getInnerEl(calendar.el).innerHTML).toBe('<span><b>1a</b><i>my event</i></span>')
    })

    it('can return html', async () => {
      const calendar = initCalendar({
        ...options,
        eventContent: (info) => ({ html: `<b>${info.timeText}</b><i>${info.event.title}</i>` }),
      })
      await waitForSettle()

      expect(getInnerEl(calendar.el).innerHTML).toBe('<b>1a</b><i>my event</i>')
    })

    it('can return text', async () => {
      const calendar = initCalendar({
        ...options,
        eventContent: (info) => info.timeText + ' - ' + info.event.title,
      })
      await waitForSettle()

      expect(getInnerEl(calendar.el).innerHTML).toBe('1a - my event')
    })

    it('can return DOM nodes', async () => {
      const calendar = initCalendar({
        ...options,
        eventContent: () => {
          const el = document.createElement('div')
          el.className = 'custom'
          el.textContent = 'custom content'
          return { domNodes: [el] }
        },
      })
      await waitForSettle()

      expect(getInnerEl(calendar.el).innerHTML).toBe('<div class="custom">custom content</div>')
    })

    it('renders nothing when it returns nothing', async () => {
      const calendar = initCalendar({
        ...options,
        eventContent: () => undefined,
      })
      await waitForSettle()

      expect(getInnerEl(calendar.el).textContent).toBe('')
    })

    it('renders the default content when it returns true', async () => {
      const calendar = initCalendar({
        ...options,
        eventContent: () => true,
      })
      await waitForSettle()

      expect(getEventTexts(getVisibleEventEls(calendar.el)[0])).toEqual({ time: '1a', title: 'my event' })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/6079
    it('can be view-specific', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridWeek',
        initialDate: '2021-01-07',
        views: {
          dayGridWeek: {
            eventContent: () => {
              const el = document.createElement('div')
              el.innerText = 'test dayGridWeek'
              return { domNodes: [el] }
            },
          },
        },
        events: [{ start: '2021-01-07', title: 'default title' }],
      })
      await waitForSettle()
      expect(getVisibleEventEls(calendar.el)[0].textContent).toBe('test dayGridWeek')

      calendar.changeView('dayGridMonth')
      await waitForSettle()
      expect(getVisibleEventEls(calendar.el)[0].textContent).toBe('default title')
    })
  })

  describe.each([
    { view: 'dayGridMonth', timeText: '9a' },
    { view: 'timeGridWeek', timeText: '9:00' },
  ])('foreground event hooks in $view', ({ view, timeText }) => {
    it('pass event info to eventContent, and the element to eventDidMount', async () => {
      const eventContent = vi.fn((_info: EventDisplayInfo) => true)
      const eventDidMount = vi.fn((info: { el: HTMLElement }) => {
        info.el.style.fontSize = '20px'
      })
      const calendar = initCalendar({
        initialView: view,
        initialDate: '2014-11-12',
        scrollTime: '00:00:00',
        events: [{ title: 'my event', start: '2014-11-12T09:00:00' }],
        eventContent,
        eventDidMount,
      })
      await waitForSettle()

      const eventEl = getVisibleEventEls(calendar.el)[0]
      const contentInfo = eventContent.mock.lastCall![0]
      expect(contentInfo.event.title).toBe('my event')
      expect(contentInfo.event.display).toBe('auto')
      expect(contentInfo.event.startStr).toBe('2014-11-12T09:00:00Z')
      expect(contentInfo.view.type).toBe(view)
      expect(contentInfo.timeText).toBe(timeText)
      expect(contentInfo.isMirror).toBe(false)

      const mountInfo = eventDidMount.mock.lastCall![0]
      expect(mountInfo.el).toBe(eventEl)
      expect(getComputedStyle(eventEl).fontSize).toBe('20px')
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5916
  it('renders several prop changes made in eventDidMount, also after navigating', async () => {
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2020-12-13',
      scrollTime: '09:00',
      eventDidMount(info) {
        info.event.setProp('color', 'red')
        info.event.setProp('title', 'name changed')
      },
      events: [
        { id: 'a', title: 'a', start: '2020-12-15T09:30:00' },
        { id: 'b', title: 'b', start: '2020-12-22T09:30:00' },
      ],
    })
    await waitForSettle()

    function expectChanged(eventId: string): void {
      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(1)
      expect(getEventTexts(eventEls[0]).title).toBe('name changed')
      expect(getComputedStyle(eventEls[0]).backgroundColor).toBe('rgb(255, 0, 0)')

      const event = calendar.getEventById(eventId)!
      expect(event.title).toBe('name changed')
      expect(event.color).toBe('red')
    }

    expectChanged('a')

    calendar.next()
    await waitForSettle()
    expectChanged('b')
  })

  it('calls eventWillUnmount with the element when an event is removed', async () => {
    const eventWillUnmount = vi.fn()
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2014-11-12',
      events: [
        { id: '1', start: '2014-11-12' },
        { id: '2', start: '2014-11-13' },
      ],
      eventWillUnmount,
    })
    await waitForSettle()
    const eventEl = getVisibleEventEls(calendar.el)[0]
    eventWillUnmount.mockClear() // ignores strict-mode double renders

    calendar.getEventById('1')!.remove()
    await waitForSettle()

    expect(eventWillUnmount).toHaveBeenCalledOnce()
    expect(eventWillUnmount.mock.calls[0][0].event.id).toBe('1')
    expect(eventWillUnmount.mock.calls[0][0].el).toBe(eventEl)
    expect(getVisibleEventEls(calendar.el).length).toBe(1)
  })

  it('pass event info and the element to the background event hooks', async () => {
    const backgroundEventContent = vi.fn((_info: EventDisplayInfo) => true)
    const backgroundEventDidMount = vi.fn((info: { el: HTMLElement }) => {
      info.el.style.fontSize = '20px'
    })
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2014-11-12',
      events: [{ title: 'my event', start: '2014-11-12', display: 'background' }],
      backgroundEventContent,
      backgroundEventDidMount,
    })
    await waitForSettle()

    const bgEventEls = getBgEventEls(calendar.el)
    expect(bgEventEls.length).toBe(1)

    const contentInfo = backgroundEventContent.mock.lastCall![0]
    expect(contentInfo.event.title).toBe('my event')
    expect(contentInfo.event.display).toBe('background')
    expect(contentInfo.event.startStr).toBe('2014-11-12')
    expect(contentInfo.view.type).toBe('dayGridMonth')

    expect(backgroundEventDidMount.mock.lastCall![0].el).toBe(bgEventEls[0])
    expect(getComputedStyle(bgEventEls[0]).fontSize).toBe('20px')
  })

  /*
  The default content's time and title elements aren't render-hook containers. Their classes reach
  the default renderer through the timeClass/titleClass render props, and their parts are marked too.
  */
  describe('default content parts', () => {
    it.each([
      ['a timed dayGrid event', 'dayGridMonth', '2014-11-12T09:00:00', 'listItemEvent', '9a'],
      ['an all-day dayGrid event', 'dayGridMonth', '2014-11-12', 'blockEvent rowEvent', ''],
      ['a timeGrid event', 'timeGridWeek', '2014-11-12T09:00:00', 'blockEvent columnEvent', '9:00'],
    ])('marks the time and title of %s', async (_desc, initialView, start, variants, timeText) => {
      const calendar = initCalendar({
        initialView,
        initialDate: '2014-11-12',
        scrollTime: '00:00',
        events: [{ title: 'my event', start }],
      })
      await waitForSettle()

      const eventEl = getVisibleEventEls(calendar.el)[0]
      const withVariants = (suffix: string) => ['event' + suffix, ...variants.split(' ').map((v) => v + suffix)].sort()
      const timeEl = queryPart(eventEl, 'eventTime')
      const titleEl = queryPart(eventEl, 'eventTitle')!

      if (timeText) {
        expect(getParts(timeEl!).sort()).toEqual(withVariants('Time'))
        expect(timeEl!.textContent).toBe(timeText)
      } else {
        expect(timeEl).toBeNull()
      }
      expect(getParts(titleEl).sort()).toEqual(withVariants('Title'))
      expect(titleEl.textContent).toBe('my event')
    })

    it('marks the title of a background event', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2014-11-12',
        events: [{ title: 'my event', start: '2014-11-12', display: 'background' }],
      })
      await waitForSettle()

      const titleEl = queryPart(getBgEventEls(calendar.el)[0], 'backgroundEventTitle')!
      expect(getParts(titleEl)).toEqual(['backgroundEventTitle'])
      expect(titleEl.textContent).toBe('my event')
    })
  })
})
