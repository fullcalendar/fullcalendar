// most other businessHours tests are in background-events.js

import { doElsMatchSegs } from '../lib/segs.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('businessHours', () => {
  pushOptions({
    timeZone: 'UTC',
    initialDate: '2014-11-25',
    initialView: 'dayGridMonth',
    businessHours: true,
  })

  it('doesn\'t break when starting out in a larger month time range', () => {
    let calendar = initCalendar() // start out in the month range

    currentCalendar.changeView('timeGridWeek')
    currentCalendar.next() // move out of the original month range...
    currentCalendar.next() // ... out. should render correctly.

    // whole days
    let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid
    expect(dayGridWrapper.getNonBusinessDayEls().length).toBe(2) // each multi-day stretch is one element

    // timed area
    expect(isTimeGridNonBusinessSegsRendered(calendar, [
      // sun
      { start: '2014-12-07T00:00', end: '2014-12-08T00:00' },
      // mon
      { start: '2014-12-08T00:00', end: '2014-12-08T09:00' },
      { start: '2014-12-08T17:00', end: '2014-12-09T00:00' },
      // tue
      { start: '2014-12-09T00:00', end: '2014-12-09T09:00' },
      { start: '2014-12-09T17:00', end: '2014-12-10T00:00' },
      // wed
      { start: '2014-12-10T00:00', end: '2014-12-10T09:00' },
      { start: '2014-12-10T17:00', end: '2014-12-11T00:00' },
      // thu
      { start: '2014-12-11T00:00', end: '2014-12-11T09:00' },
      { start: '2014-12-11T17:00', end: '2014-12-12T00:00' },
      // fri
      { start: '2014-12-12T00:00', end: '2014-12-12T09:00' },
      { start: '2014-12-12T17:00', end: '2014-12-13T00:00' },
      // sat
      { start: '2014-12-13T00:00', end: '2014-12-14T00:00' },
    ])).toBe(true)
  })

  describe('when used as a dynamic option', () => {
    ['timeGridWeek', 'dayGridMonth'].forEach((viewName) => {
      it('allows dynamic turning on', () => {
        let calendar = initCalendar({
          initialView: viewName,
          businessHours: false,
        })
        let calendarWrapper = new CalendarWrapper(calendar)

        expect(calendarWrapper.getNonBusinessDayEls().length).toBe(0)
        currentCalendar.setOption('businessHours', true)
        expect(calendarWrapper.getNonBusinessDayEls().length).toBeGreaterThan(0)
      })

      it('allows dynamic turning off', () => {
        let calendar = initCalendar({
          initialView: viewName,
          businessHours: true,
        })
        let calendarWrapper = new CalendarWrapper(calendar)

        expect(calendarWrapper.getNonBusinessDayEls().length).toBeGreaterThan(0)
        currentCalendar.setOption('businessHours', false)
        expect(calendarWrapper.getNonBusinessDayEls().length).toBe(0)
      })
    })
  })

  describe('for multiple day-of-week definitions', () => {
    it('rendes two day-of-week groups', () => {
      let calendar = initCalendar({
        initialDate: '2014-12-07',
        initialView: 'timeGridWeek',
        businessHours: [
          {
            daysOfWeek: [1, 2, 3], // mon, tue, wed
            startTime: '08:00',
            endTime: '18:00',
          },
          {
            daysOfWeek: [4, 5], // thu, fri
            startTime: '10:00',
            endTime: '16:00',
          },
        ],
      })

      // timed area
      expect(isTimeGridNonBusinessSegsRendered(calendar, [
        // sun
        { start: '2014-12-07T00:00', end: '2014-12-08T00:00' },
        // mon
        { start: '2014-12-08T00:00', end: '2014-12-08T08:00' },
        { start: '2014-12-08T18:00', end: '2014-12-09T00:00' },
        // tue
        { start: '2014-12-09T00:00', end: '2014-12-09T08:00' },
        { start: '2014-12-09T18:00', end: '2014-12-10T00:00' },
        // wed
        { start: '2014-12-10T00:00', end: '2014-12-10T08:00' },
        { start: '2014-12-10T18:00', end: '2014-12-11T00:00' },
        // thu
        { start: '2014-12-11T00:00', end: '2014-12-11T10:00' },
        { start: '2014-12-11T16:00', end: '2014-12-12T00:00' },
        // fri
        { start: '2014-12-12T00:00', end: '2014-12-12T10:00' },
        { start: '2014-12-12T16:00', end: '2014-12-13T00:00' },
        // sat
        { start: '2014-12-13T00:00', end: '2014-12-14T00:00' },
      ])).toBe(true)
    })

    it('wont\'t process businessHour items that omit dow', () => {
      let calendar = initCalendar({
        initialDate: '2014-12-07',
        initialView: 'timeGridWeek',
        businessHours: [
          {
            // invalid
            startTime: '08:00',
            endTime: '18:00',
          },
          {
            daysOfWeek: [4, 5], // thu, fri
            startTime: '10:00',
            endTime: '16:00',
          },
        ],
      })

      // timed area
      expect(isTimeGridNonBusinessSegsRendered(calendar, [
        // sun
        { start: '2014-12-07T00:00', end: '2014-12-08T00:00' },
        // mon
        { start: '2014-12-08T00:00', end: '2014-12-09T00:00' },
        // tue
        { start: '2014-12-09T00:00', end: '2014-12-10T00:00' },
        // wed
        { start: '2014-12-10T00:00', end: '2014-12-11T00:00' },
        // thu
        { start: '2014-12-11T00:00', end: '2014-12-11T10:00' },
        { start: '2014-12-11T16:00', end: '2014-12-12T00:00' },
        // fri
        { start: '2014-12-12T00:00', end: '2014-12-12T10:00' },
        { start: '2014-12-12T16:00', end: '2014-12-13T00:00' },
        // sat
        { start: '2014-12-13T00:00', end: '2014-12-14T00:00' },
      ])).toBe(true)
    })
  })

  it('will grey-out a totally non-business-hour view', () => {
    let calendar = initCalendar({
      initialDate: '2016-07-23', // sat
      initialView: 'timeGridDay',
      businessHours: true,
    })

    // timed area
    expect(isTimeGridNonBusinessSegsRendered(calendar, [
      { start: '2016-07-23T00:00', end: '2016-07-24T00:00' },
    ])).toBe(true)
  })

  function isTimeGridNonBusinessSegsRendered(calendar, segs) {
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    return doElsMatchSegs(
      timeGridWrapper.getNonBusinessDayEls(),
      segs,
      timeGridWrapper.getRect.bind(timeGridWrapper),
    )
  }
})
