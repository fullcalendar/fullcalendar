import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('refetchEvents', () => {
  // there IS a similar test in automated-better, but does month view
  describe('when timeGrid events are rerendered', () => {
    it('keeps scroll after refetchEvents', (done) => {
      let calendar = initCalendar({
        now: '2015-08-07',
        scrollTime: '00:00',
        height: 400, // makes this test more consistent across viewports
        initialView: 'timeGridDay',
        events(arg, callback) {
          setTimeout(() => {
            callback([
              { id: '1', resourceId: 'b', start: '2015-08-07T02:00:00', end: '2015-08-07T07:00:00', title: 'event 1' },
              { id: '2', resourceId: 'c', start: '2015-08-07T05:00:00', end: '2015-08-07T22:00:00', title: 'event 2' },
              { id: '3', resourceId: 'd', start: '2015-08-06', end: '2015-08-08', title: 'event 3' },
              { id: '4', resourceId: 'e', start: '2015-08-07T03:00:00', end: '2015-08-07T08:00:00', title: 'event 4' },
              { id: '5', resourceId: 'f', start: '2015-08-07T00:30:00', end: '2015-08-07T02:30:00', title: 'event 5' },
            ])
          }, 100)
        },
      })

      setTimeout(() => {
        let viewWrapper = new TimeGridViewWrapper(calendar)
        let scrollEl = viewWrapper.getScrollerEl()

        scrollEl.scrollTop = 100
        setTimeout(() => {
          currentCalendar.refetchEvents()

          setTimeout(() => {
            expect(scrollEl.scrollTop).toBe(100)
            done()
          }, 100)
        }, 100)
      }, 101) // after the fetch
    })
  })

  describe('when there are multiple event sources', () => {
    let fetchCount // affects events created in createEventGenerator
    let eventSources

    pushOptions({
      now: '2015-08-07',
      initialView: 'timeGridWeek',
    })

    beforeEach(() => {
      fetchCount = 0
      eventSources = [
        {
          events: createEventGenerator(),
          color: 'green',
          id: 'source1',
        },
        {
          events: createEventGenerator(),
          color: 'blue',
          id: 'source2',
        },
        {
          events: createEventGenerator(),
          color: 'red',
          id: 'source3',
        },
      ]
    })

    describe('and all events are fetched synchronously', () => {
      it('all events are immediately updated', (done) => {
        initCalendar({ eventSources })
        fetchCount += 1
        currentCalendar.refetchEvents()
        expect($('.fetch0').length).toEqual(0)
        expect($('.fetch1').length).toEqual(3)
        done()
      })
    })

    describe('and one event source is asynchronous', () => {
      it('original events remain on the calendar until all events have been refetched', (done) => {
        // set a 100ms timeout on this event source
        eventSources[0].events = (arg, callback) => {
          let events = [
            { id: '1',
              start: '2015-08-07T02:00:00',
              end: '2015-08-07T03:00:00',
              title: 'event A',
              className: 'fetch' + fetchCount },
          ]
          setTimeout(() => {
            callback(events)
          }, 100)
        }

        initCalendar({
          eventSources,
        })

        setTimeout(() => {
          fetchCount += 1
          currentCalendar.refetchEvents()
          expect($('.fetch0').length).toEqual(3) // original events still on the calendar
          expect($('.fetch1').length).toEqual(0) // new events not yet refetched

          setTimeout(() => {
            expect($('.fetch0').length).toEqual(0)
            expect($('.fetch1').length).toEqual(3)
            done()
          }, 101)
        }, 101)
      })
    })

    // relies on fetchCount
    function createEventGenerator() {
      return (arg, callback) => {
        let events = [
          {
            id: 1,
            start: '2015-08-07T02:00:00',
            end: '2015-08-07T03:00:00',
            title: 'event A',
            className: 'fetch' + fetchCount,
          },
        ]
        callback(events)
      }
    }
  })
})
