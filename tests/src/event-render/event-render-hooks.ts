import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { RED_REGEX } from '../lib/dom-misc.js'

describe('eventContent', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2020-06-01',
    events: [
      { title: 'my event', start: '2020-06-01T01:00:00' },
    ],
  })

  it('can inject vdom nodes', () => {
    let calendar = initCalendar({
      eventContent(info, createElement) {
        return (
          createElement('span', {}, [ // TODO: document how to use Fragment
            createElement('b', {}, info.timeText),
            createElement('i', {}, info.event.title),
          ])
        )
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]
    expect(eventEl.querySelector('b').innerHTML).toBe('1a')
    expect(eventEl.querySelector('i').innerHTML).toBe('my event')
  })

  it('can inject html content', () => {
    let calendar = initCalendar({
      eventContent(info) {
        return {
          html: `<b>${info.timeText}</b><i>${info.event.title}</i>`,
        }
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]
    expect(eventEl.querySelector('b').innerHTML).toBe('1a')
    expect(eventEl.querySelector('i').innerHTML).toBe('my event')
  })

  it('can inject text content', () => {
    let calendar = initCalendar({
      eventContent(info) {
        return info.timeText + ' - ' + info.event.title
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]
    expect(eventEl.innerHTML).toBe('1a - my event')
  })

  it('will render blank content if nothing returned', () => {
    let calendar = initCalendar({
      eventContent() {
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]
    expect($(eventEl).text()).toBe('')
  })

  it('can return true to render default content', () => {
    let calendar = initCalendar({
      eventContent() {
        return true
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]
    expect($(eventEl).text()).toMatch('my event')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5916
  xit('can render multiple appearance changes in eventDidMount', () => {
    let calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2020-12-13',
      eventDidMount(arg) {
        arg.event.setProp('backgroundColor', 'red')
        arg.event.setProp('title', 'name changed')
      },
      events: [
        {
          id: 'a',
          title: 'a',
          start: '2020-12-15T09:30:00',
        },
        {
          id: 'b',
          title: 'b',
          start: '2020-12-22T09:30:00',
        },
      ],
    })

    function expectEventDataChanged(id) {
      let event = calendar.getEventById(id)
      expect(event.title).toBe('name changed')
      expect(event.backgroundColor).toBe('red')
    }

    let viewWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let eventEl = viewWrapper.getEventEls()[0]
    expect($(eventEl).css('background-color')).toMatch(RED_REGEX)
    expectEventDataChanged('a')

    calendar.next()
    eventEl = viewWrapper.getEventEls()[0]
    expect($(eventEl).css('background-color')).toMatch(RED_REGEX)
    expectEventDataChanged('b')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6079
  it('can handle view-specific custom content generators', () => {
    let calendar = initCalendar({
      initialView: 'dayGridWeek',
      initialDate: '2021-01-07',
      views: {
        dayGridWeek: {
          eventContent() {
            let eventWrapper = document.createElement('div')
            eventWrapper.innerText = 'test dayGridWeek'
            let arrayOfDomNodes = [eventWrapper]
            return { domNodes: arrayOfDomNodes }
          },
        },
      },
      events: [
        { start: '2021-01-07', title: 'default title' },
      ],
    })

    let dayGrid = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGrid.getEventEls()[0]
    expect(eventEl.innerText.trim()).toBe('test dayGridWeek')

    calendar.changeView('dayGridMonth')

    dayGrid = new DayGridViewWrapper(calendar).dayGrid
    eventEl = dayGrid.getEventEls()[0]
    expect(eventEl.innerText.trim()).toBe('default title')
  })
})
