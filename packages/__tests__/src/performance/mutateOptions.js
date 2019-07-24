import deepEqual from 'fast-deep-equal'
import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import { getFirstDateEl } from '../lib/ViewUtils'
import { getEventEls } from '../event-render/EventRenderUtils'
import { getTimeGridScroller, allDaySlotDisplayed } from '../lib/TimeGridViewUtils'

function buildOptions() {
  return {
    plugins: [ timeGridPlugin ],
    defaultView: 'timeGridWeek',
    defaultDate: '2019-04-01',
    scrollTime: '00:00',
    allDaySlot: true,
    events: [
      { start: '2019-04-01T00:00:00' },
      { start: '2019-04-01T02:00:00' }
    ]
  }
}

describe('mutateOptions', function() {
  let $calendarEl
  let calendar

  beforeEach(function() {
    $calendarEl = $('<div>').appendTo('body')
  })

  afterEach(function() {
    if (calendar) { calendar.destroy() }
    $calendarEl.remove()
  })

  function mutateOptions(updates) {
    calendar.mutateOptions(updates, [], false, deepEqual)
  }

  it('will react to a single option and keep scroll', function() {
    calendar = new Calendar($calendarEl[0], buildOptions())
    calendar.render()

    let scrollEl = getTimeGridScroller()
    scrollEl.scrollTop = 100
    let scrollTop = scrollEl.scrollTop
    expect(scrollTop).toBeGreaterThan(0)

    mutateOptions({ allDaySlot: false })

    expect(calendar.getOption('allDaySlot')).toBe(false)
    expect(allDaySlotDisplayed()).toBe(false)
    expect(getTimeGridScroller().scrollTop).toBe(scrollTop)
  })

  it('rerenders events without rerendering view', function() {
    calendar = new Calendar($calendarEl[0], buildOptions())
    calendar.render()
    let dateEl = getFirstDateEl()

    mutateOptions({
      events: [
        { start: '2019-04-01T00:00:00' }
      ]
    })

    expect(getEventEls().length).toBe(1)
    expect(getFirstDateEl()).toBe(dateEl)
  })

  it('doesn\'t rerender anything for a defaultView change', function() {
    calendar = new Calendar($calendarEl[0], buildOptions())
    calendar.render()
    let dateEl = getFirstDateEl()

    mutateOptions({
      defaultView: 'timeGridDay'
    })

    expect(calendar.view.type).toBe('timeGridWeek')
    expect(getFirstDateEl()).toBe(dateEl)
  })

})
