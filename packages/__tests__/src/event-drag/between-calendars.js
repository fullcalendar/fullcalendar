import { Calendar } from '@fullcalendar/core'
import InteractionPlugin from '@fullcalendar/interaction'
import DayGridPlugin from '@fullcalendar/daygrid'
import TimeGridPlugin from '@fullcalendar/timegrid'
import { getSingleEl } from '../event-render/EventRenderUtils'
import { getDayEl } from '../view-render/DayGridRenderUtils'
import { getRectCenter } from '../lib/geom'

describe('dragging events between calendars', function() {
  let DEFAULT_DATE = '2019-01-01'
  let el0, el1
  let calendar0, calendar1

  beforeEach(function() {
    el0 = document.createElement('div')
    el1 = document.createElement('div')

    el0.style.width = el1.style.width = '50%'
    el0.style.cssFloat = el1.style.cssFloat = 'left'

    document.body.appendChild(el0)
    document.body.appendChild(el1)
  })

  afterEach(function() {
    if (calendar0) {
      calendar0.destroy()
    }

    if (calendar1) {
      calendar1.destroy()
    }

    document.body.removeChild(el0)
    document.body.removeChild(el1)
  })

  it('fires all triggers', function(done) {
    let triggerNames = []
    let eventAllowCalled = false

    calendar0 = new Calendar(el0, {
      plugins: [ InteractionPlugin, DayGridPlugin ],
      timeZone: 'UTC',
      defaultDate: DEFAULT_DATE,
      defaultView: 'dayGridMonth',
      editable: true,
      events: [
        { start: '2019-01-01', id: 'a' }
      ],
      eventLeave: function(info) {
        triggerNames.push('eventLeave')
        expect(info.draggedEl).toBe(eventEl)
        expect(info.event.id).toBe('a')
      }
    })

    calendar1 = new Calendar(el1, {
      plugins: [ InteractionPlugin, DayGridPlugin ],
      timeZone: 'UTC',
      defaultDate: DEFAULT_DATE,
      defaultView: 'dayGridMonth',
      editable: true,
      droppable: true,
      drop(info) {
        triggerNames.push('drop')
        expect(info.draggedEl).toBe(eventEl)
        expect(info.date).toEqualDate('2019-01-05')
        expect(info.dateStr).toBe('2019-01-05')
        expect(info.allDay).toBe(true)
      },
      eventAllow() {
        eventAllowCalled = true
        return true
      },
      eventReceive(info) {
        triggerNames.push('eventReceive')
        expect(info.draggedEl).toBe(eventEl)
        expect(info.event.start).toEqualDate('2019-01-05')
      }
    })

    calendar0.render()
    calendar1.render()

    let eventEl = getSingleEl()[0]
    let dayEl = getDayEl('2019-01-05')[1] // the one from the SECOND calendar
    let point0 = getRectCenter(eventEl.getBoundingClientRect())
    let point1 = getRectCenter(dayEl.getBoundingClientRect())

    $(eventEl).simulate('drag', {
      point: point0,
      end: point1,
      callback: function() {
        expect(triggerNames).toEqual([ 'eventLeave', 'drop', 'eventReceive' ])
        expect(eventAllowCalled).toBe(true)
        done()
      }
    })
  })

  it('works between timeGrid views', function(done) {

    calendar0 = new Calendar(el0, {
      plugins: [ InteractionPlugin, TimeGridPlugin ],
      scrollTime: '00:00',
      timeZone: 'UTC',
      defaultDate: DEFAULT_DATE,
      defaultView: 'timeGridDay',
      editable: true,
      events: [
        { start: '2019-01-01T00:00:00', id: 'a' }
      ]
    })

    calendar1 = new Calendar(el1, {
      plugins: [ InteractionPlugin, TimeGridPlugin ],
      scrollTime: '00:00',
      timeZone: 'UTC',
      defaultDate: DEFAULT_DATE,
      defaultView: 'timeGridDay',
      editable: true,
      droppable: true,
      eventReceive: function(info) {
        done()
      }
    })

    calendar0.render()
    calendar1.render()

    let eventEl = getSingleEl()[0]
    let point0 = getRectCenter(eventEl.getBoundingClientRect())
    let point1 = getRectCenter(el1.querySelector('.fc-time-grid-container').getBoundingClientRect())

    $(eventEl).simulate('drag', {
      point: point0,
      end: point1
    })
  })

})
