import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('dateClick', () => {
  pushOptions({
    initialDate: '2014-05-27',
    selectable: false,
    timeZone: 'UTC',
  })

  describeOptions('direction', {
    'when LTR': 'ltr',
    'when RTL': 'rtl',
  }, () => {
    describeOptions('selectable', {
      'when NOT selectable': false,
      'when selectable': true,
    }, () => {
      describe('when in month view', () => {
        pushOptions({
          initialView: 'dayGridMonth',
        })

        it('fires correctly when clicking on a cell', (done) => {
          let calendar = initCalendar({
            dateClick(arg) {
              expect(arg.date instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(true)
              expect(arg.date).toEqualDate('2014-05-07')
              expect(arg.dateStr).toEqual('2014-05-07')
              done()
            },
          })
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
          dayGridWrapper.clickDate('2014-05-07')
        })
      })

      describe('when in week view', () => {
        pushOptions({
          initialView: 'timeGridWeek',
        })

        it('fires correctly when clicking on an all-day slot', (done) => {
          let calendar = initCalendar({
            dateClick(arg) {
              expect(arg.date instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(true)
              expect(arg.date).toEqualDate('2014-05-28')
              expect(arg.dateStr).toEqual('2014-05-28')
              done()
            },
          })
          let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid
          dayGridWrapper.clickDate('2014-05-28')
        })

        it('fires correctly when clicking on a timed slot', (done) => {
          let calendar = initCalendar({
            contentHeight: 500, // make sure the click slot will be in scroll view
            scrollTime: '07:00:00',
            dateClick(arg) {
              expect(arg.date instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(false)
              expect(arg.date).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.dateStr).toEqual('2014-05-28T09:00:00Z')
              done()
            },
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          timeGridWrapper.clickDate('2014-05-28T09:00:00')
        })

        // issue 2217
        it('fires correctly when clicking on a timed slot, with slotMinTime set', (done) => {
          let calendar = initCalendar({
            contentHeight: 500, // make sure the click slot will be in scroll view
            scrollTime: '07:00:00',
            slotMinTime: '02:00:00',
            dateClick(arg) {
              expect(arg.date instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(false)
              expect(arg.date).toEqualDate('2014-05-28T11:00:00Z')
              expect(arg.dateStr).toEqual('2014-05-28T11:00:00Z')
              done()
            },
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          timeGridWrapper.clickDate('2014-05-28T11:00:00')
        })

        // https://github.com/fullcalendar/fullcalendar/issues/4539
        it('fires correctly when clicking on a timed slot NEAR END', (done) => {
          let calendar = initCalendar({
            contentHeight: 500, // make sure the click slot will be in scroll view
            scrollTime: '23:00:00',
            dateClick(arg) {
              expect(arg.date instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(false)
              expect(arg.date).toEqualDate('2014-05-28T23:30:00Z')
              expect(arg.dateStr).toEqual('2014-05-28T23:30:00Z')
              done()
            },
          })
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          timeGridWrapper.clickDate('2014-05-28T23:30:00')
        })
      })
    })
  })

  it('will still fire if clicked on background event', (done) => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      events: [{
        start: '2014-05-06',
        display: 'background',
      }],
      dateClick(info) {
        expect(info.dateStr).toBe('2014-05-06')
        done()
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    $.simulateMouseClick(dayGridWrapper.getBgEventEls()[0])
  })

  describe('when touch', () => {
    it('fires correctly when simulated short drag on a cell', (done) => {
      let calendar = initCalendar({
        dateClick(arg) {
          expect(arg.date instanceof Date).toEqual(true)
          expect(typeof arg.jsEvent).toEqual('object') // TODO: more discrimination
          expect(typeof arg.view).toEqual('object') // "
          expect(arg.allDay).toEqual(true)
          expect(arg.date).toEqualDate('2014-05-07')
          expect(arg.dateStr).toEqual('2014-05-07')
          done()
        },
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      $.simulateTouchClick(dayGridWrapper.getDayEl('2014-05-07'))
    })

    it('won\'t fire if touch moves outside of date cell', (done) => {
      let dateClickSpy = spyOnCalendarCallback('dateClick')
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      let startCell = dayGridWrapper.getDayEl('2014-05-07')
      let endCell = dayGridWrapper.getDayEl('2014-05-08')

      $(startCell).simulate('drag', {
        // FYI, when debug:true, not a good representation because the minimal  delay is required
        // to recreate bug #3332
        isTouch: true,
        end: endCell,
        callback() {
          expect(dateClickSpy).not.toHaveBeenCalled()
          done()
        },
      })
    })

    it('fires correctly when simulated click on a cell', (done) => {
      let calendar = initCalendar({
        dateClick(arg) {
          expect(arg.date instanceof Date).toEqual(true)
          expect(typeof arg.jsEvent).toEqual('object') // TODO: more discrimination
          expect(typeof arg.view).toEqual('object') // "
          expect(arg.allDay).toEqual(true)
          expect(arg.date).toEqualDate('2014-05-07')
          expect(arg.dateStr).toEqual('2014-05-07')
          done()
        },
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      let dayCell = dayGridWrapper.getDayEl('2014-05-07')
      $.simulateTouchClick(dayCell)
    })
  })
})
