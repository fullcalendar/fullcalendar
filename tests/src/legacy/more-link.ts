import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { filterVisibleEls } from '../lib/dom-misc.js'

describe('dayMaxEventRows', () => {
  pushOptions({
    initialDate: '2014-08-01', // important that it is the first week, so works w/ month + week views
    dayMaxEventRows: 3,
  })

  describe('as a number', () => {
    describeOptions('initialView', {
      'when in month view': 'dayGridMonth',
      'when in dayGridWeek view': 'dayGridWeek',
      'when in week view': 'timeGridWeek',
    }, (viewName) => {
      let ViewWrapper = viewName.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper

      it('doesn\'t display a more link when limit is more than the # of events', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
          ],
        })
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getMoreEls().length).toBe(0)
      })

      it('doesn\'t display a more link when limit equal to the # of events', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
          ],
        })
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getMoreEls().length).toBe(0)
      })

      it('displays a more link when limit is less than the # of events', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
          ],
        })
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid
        let moreEls = dayGridWrapper.getMoreEls()
        expect(moreEls.length).toBe(1)
        expect(moreEls[0]).toHaveText('+2 more')
      })

      it('displays one more per day, when a multi-day event is above', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
          ],
        })
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid
        let moreEls = dayGridWrapper.getMoreEls()
        let cells = dayGridWrapper.getDayElsInRow(0)
        expect(moreEls.length).toBe(2)
        expect(moreEls[0]).toHaveText('+2 more')
        expect(moreEls[0]).toBeBoundedBy(cells[2])
        expect(moreEls[1]).toHaveText('+2 more')
        expect(moreEls[1]).toBeBoundedBy(cells[3])
      })

      it('will render a pertially hidden single-day event', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event2', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event3', start: '2014-07-29', end: '2014-07-31' },
            { title: 'event4', start: '2014-07-29' },
          ],
        })
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid
        let eventEls = dayGridWrapper.getEventEls()
        let visibleEventEls = filterVisibleEls(eventEls)
        let moreEls = dayGridWrapper.getMoreEls()
        let cells = dayGridWrapper.getAllDayEls()
        expect(visibleEventEls.length).toBe(3)
        expect(moreEls.length).toBe(1)
        expect(moreEls[0]).toHaveText('+2 more')
        expect(moreEls[0]).toBeBoundedBy(cells[2])
      })

      // https://github.com/fullcalendar/fullcalendar/issues/6187
      it('will render a partially multi-day hidden event', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event3', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event4', start: '2014-07-29', end: '2014-07-31' },
          ],
        })
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid
        let eventEls = dayGridWrapper.getEventEls()
        let visibleEventEls = filterVisibleEls(eventEls)
        let moreEls = dayGridWrapper.getMoreEls()
        let cells = dayGridWrapper.getDayElsInRow(0)
        expect(visibleEventEls.length).toBe(4)
        expect(moreEls.length).toBe(1)
        expect(moreEls[0]).toHaveText('+2 more')
        expect(moreEls[0]).toBeBoundedBy(cells[2])
      })

      it('will render a link in place of a hidden single day event, if covered by a multi-day', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event3', start: '2014-07-28' },
            { title: 'event4', start: '2014-07-28' },
          ],
        })
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid
        let cells = dayGridWrapper.getDayElsInRow(0)
        let moreEls = dayGridWrapper.getMoreEls()
        expect(moreEls.length).toBe(1)
        expect(moreEls[0]).toHaveText('+2 more')
        expect(moreEls[0]).toBeBoundedBy(cells[1])
      })

      it('will render a link in place of a hidden single day event, if covered by a multi-day ' +
        'and in its second column',
      () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
            { title: 'event3', start: '2014-07-29' },
            { title: 'event4', start: '2014-07-29' },
          ],
        })
        let dayGridWrapper = new ViewWrapper(calendar).dayGrid
        let cells = dayGridWrapper.getDayElsInRow(0)
        let moreEls = dayGridWrapper.getMoreEls()
        expect(moreEls.length).toBe(1)
        expect(moreEls[0]).toHaveText('+2 more')
        expect(moreEls[0]).toBeBoundedBy(cells[2])
      })
    })
  })

  describe('when auto', () => {
    pushOptions({
      dayMaxEvents: true,
    })

    describe('in month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
        events: [
          { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event2', start: '2014-07-28', end: '2014-07-30' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
          { title: 'event2', start: '2014-07-29' },
        ],
      })

      it('renders the heights of all the rows the same, regardless of # of events', () => {
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let rowEls = dayGridWrapper.getRowEls()
        expect(rowEls.length).toBeGreaterThan(0)

        let rowHeights = rowEls.map((rowEl) => rowEl.getBoundingClientRect().height)
        let totalHeight = rowHeights.reduce((prev, current) => prev + current, 0)
        let aveHeight = totalHeight / rowHeights.length

        rowHeights.forEach((rowHeight) => {
          let diff = Math.abs(rowHeight - aveHeight)
          expect(diff).toBeLessThan(2)
        })
      })

      it('renders a more link when there are obviously too many events', () => {
        let $el = $('<div id="calendar">').appendTo('body').width(800)
        let calendar = initCalendar({}, $el)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let moreEls = dayGridWrapper.getMoreEls()
        expect(moreEls.length).toBe(1)
      })
    })

    describeOptions('initialView', {
      'when in month view': 'dayGridMonth',
      'when in dayGridWeek view': 'dayGridWeek',
    }, () => {
      it('doesn\'t render a more link where there should obviously not be a limit', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-28', end: '2014-07-30' },
          ],
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getMoreEls().length).toBe(0)
      })
    })

    describe('in week view', () => {
      pushOptions({
        initialView: 'timeGridWeek',
      })

      it('behaves as if limit is 5', () => {
        let calendar = initCalendar({
          events: [
            { title: 'event1', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
            { title: 'event2', start: '2014-07-29' },
          ],
        })
        let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid
        let eventEls = filterVisibleEls(dayGridWrapper.getEventEls())
        let moreEls = dayGridWrapper.getMoreEls()

        expect(eventEls.length).toBe(4)
        expect(moreEls.length).toBe(1)
        expect(moreEls[0]).toHaveText('+3 more')
      })
    })
  })
})
