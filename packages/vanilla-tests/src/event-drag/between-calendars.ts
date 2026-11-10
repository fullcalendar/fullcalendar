import { Calendar } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import interactionPlugin from 'fullcalendar/interaction'
import dayGridPlugin from 'fullcalendar/daygrid'
import timeGridPlugin from 'fullcalendar/timegrid'
import { getRectCenter } from '../lib/geom'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { waitTimeout } from '../lib/misc'

describe('dragging events between calendars', () => {
  let DEFAULT_DATE = '2019-01-01'
  let el0
  let el1
  let calendar0
  let calendar1

  beforeEach(() => {
    el0 = document.createElement('div')
    el1 = document.createElement('div')

    el0.style.width = el1.style.width = '50%'
    el0.style.cssFloat = el1.style.cssFloat = 'left'

    document.body.appendChild(el0)
    document.body.appendChild(el1)
  })

  afterEach(() => {
    if (calendar0) {
      calendar0.destroy()
    }

    if (calendar1) {
      calendar1.destroy()
    }

    document.body.removeChild(el0)
    document.body.removeChild(el1)
  })

  it('fires all triggers', (done) => {
    let triggerNames = []
    let eventAllowCalled = false
    let eventEl

    calendar0 = new Calendar(el0, {
      plugins: [classicThemePlugin, themeForTestsPlugin, interactionPlugin, dayGridPlugin],
      timeZone: 'UTC',
      initialDate: DEFAULT_DATE,
      initialView: 'dayGridMonth',
      editable: true,
      events: [
        { start: '2019-01-01', id: 'a' },
      ],
      eventLeave(info) {
        triggerNames.push('eventLeave')
        expect(info.draggedEl).toBe(eventEl)
        expect(info.event.id).toBe('a')
        expect(typeof info.revert).toBe('function')
        expect(Array.isArray(info.relatedEvents)).toBe(true)
      },
    })

    calendar1 = new Calendar(el1, {
      plugins: [classicThemePlugin, themeForTestsPlugin, interactionPlugin, dayGridPlugin],
      timeZone: 'UTC',
      initialDate: DEFAULT_DATE,
      initialView: 'dayGridMonth',
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
        expect(typeof info.revert).toBe('function')
        expect(Array.isArray(info.relatedEvents)).toBe(true)
      },
    })

    calendar0.render()
    calendar1.render()
    waitTimeout().then(() => {
      let dayGridWrapper0 = new DayGridViewWrapper(calendar0).dayGrid
      let dayGridWrapper1 = new DayGridViewWrapper(calendar1).dayGrid

      eventEl = dayGridWrapper0.getEventEls()[0]
      let dayEl = dayGridWrapper1.getDayEls('2019-01-05')[0]
      let point1 = getRectCenter(dayEl.getBoundingClientRect())

      $(eventEl).simulate('drag', {
        end: point1,
        callback() {
          expect(triggerNames).toEqual(['eventLeave', 'drop', 'eventReceive'])
          expect(eventAllowCalled).toBe(true)
          done()
        },
      })
    })
  })

  ;[
    { slotDuration: '00:18', snapDuration: '00:18' },
    { slotDuration: '00:36', snapDuration: '00:18' },
    // An indivisible override falls back to slotDuration in timeGrid.
    { slotDuration: '00:18', snapDuration: '00:07' },
  ].forEach((slotOptions) => {
    it(`snaps a lower grab to the receiving grid (${JSON.stringify(slotOptions)})`, (done) => {
      let commonOptions = {
        plugins: [classicThemePlugin, themeForTestsPlugin, interactionPlugin, timeGridPlugin],
        initialDate: DEFAULT_DATE,
        initialView: 'timeGridDay',
        timeZone: 'UTC',
        editable: true,
        droppable: true,
        headerToolbar: false as const,
        allDaySlot: false,
        height: 'auto',
        slotMinTime: '06:00',
        slotMaxTime: '12:00',
      }
      calendar0 = new Calendar(el0, {
        ...commonOptions,
        slotDuration: '00:30',
        events: [{ id: 'a', title: 'Meeting', start: '2019-01-01T10:00:00', end: '2019-01-01T11:00:00' }],
      })
      calendar1 = new Calendar(el1, { ...commonOptions, ...slotOptions })
      calendar0.render()
      calendar1.render()

      waitTimeout().then(() => {
        let eventEl = new CalendarWrapper(calendar0).getEventEls()[0]
        let eventRect = eventEl.getBoundingClientRect()
        let sourceSlot = el0.querySelector('.fc-timegrid-slot-lane[data-time="10:30:00"]').getBoundingClientRect()
        let destSlot = el1.querySelector('.fc-timegrid-slot-lane[data-time="10:48:00"]').getBoundingClientRect()

        $(eventEl).simulate('drag', {
          point: { left: eventRect.left + 10, top: sourceSlot.top + 2 },
          end: { left: destSlot.left + 10, top: destSlot.top + 2 },
          callback() {
            expect(calendar0.getEvents().length).toBe(0)
            let events = calendar1.getEvents()
            expect(events.length).toBe(1)
            if (!events.length) {
              done.fail('No event transferred to the receiving calendar')
              return
            }
            expect(events[0].id).toBe('a')
            expect(events[0].title).toBe('Meeting')
            expect(events[0].start).toEqualDate('2019-01-01T10:12:00Z')
            expect(events[0].end).toEqualDate('2019-01-01T11:12:00Z')
            done()
          },
        })
      })
    })
  })

  it('works between timeGrid views', (done) => {
    calendar0 = new Calendar(el0, {
      plugins: [classicThemePlugin, themeForTestsPlugin, interactionPlugin, timeGridPlugin],
      scrollTime: '00:00',
      timeZone: 'UTC',
      initialDate: DEFAULT_DATE,
      initialView: 'timeGridDay',
      editable: true,
      events: [
        { start: '2019-01-01T00:00:00', id: 'a' },
      ],
    })

    calendar1 = new Calendar(el1, {
      plugins: [classicThemePlugin, themeForTestsPlugin, interactionPlugin, timeGridPlugin],
      scrollTime: '00:00',
      timeZone: 'UTC',
      initialDate: DEFAULT_DATE,
      initialView: 'timeGridDay',
      editable: true,
      droppable: true,
      eventReceive(info) {
        done()
      },
    })

    calendar0.render()
    calendar1.render()
    waitTimeout().then(() => {
      let eventEl = new CalendarWrapper(calendar0).getEventEls()[0] // of the source calendar
      let destViewWrapper = new TimeGridViewWrapper(calendar1)
      let point1 = getRectCenter(destViewWrapper.getScrollerEl().getBoundingClientRect())

      $(eventEl).simulate('drag', {
        end: point1,
      })
    })
  })
})
