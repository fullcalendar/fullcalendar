import { waitTimeout } from '../lib/misc'
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

        it('fires correctly when clicking on a cell', async () => {
          let clickResolve: () => void
          let clickPromise = new Promise<void>((resolve) => {
            clickResolve = resolve
          })
          let calendar = initCalendar({
            dateClick(info) {
              expect(info.date instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(true)
              expect(info.date).toEqualDate('2014-05-07')
              expect(info.dateStr).toEqual('2014-05-07')
              clickResolve()
            },
          })
          await waitTimeout()
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
          dayGridWrapper.clickDate('2014-05-07')
          await clickPromise
        })
      })

      describe('when in week view', () => {
        pushOptions({
          initialView: 'timeGridWeek',
        })

        it('fires correctly when clicking on an all-day slot', async () => {
          let clickResolve: () => void
          let clickPromise = new Promise<void>((resolve) => {
            clickResolve = resolve
          })
          let calendar = initCalendar({
            dateClick(info) {
              expect(info.date instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(true)
              expect(info.date).toEqualDate('2014-05-28')
              expect(info.dateStr).toEqual('2014-05-28')
              clickResolve()
            },
          })
          await waitTimeout()
          let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid
          dayGridWrapper.clickDate('2014-05-28')
          await clickPromise
        })

        it('fires correctly when clicking on a timed slot', async () => {
          let clickResolve: () => void
          let clickPromise = new Promise<void>((resolve) => {
            clickResolve = resolve
          })
          let calendar = initCalendar({
            contentHeight: 500, // make sure the click slot will be in scroll view
            scrollTime: '07:00:00',
            dateClick(info) {
              expect(info.date instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(false)
              expect(info.date).toEqualDate('2014-05-28T09:00:00Z')
              expect(info.dateStr).toEqual('2014-05-28T09:00:00Z')
              clickResolve()
            },
          })
          await waitTimeout()
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          timeGridWrapper.clickDate('2014-05-28T09:00:00')
          await clickPromise
        })

        // issue 2217
        it('fires correctly when clicking on a timed slot, with slotMinTime set', async () => {
          let clickResolve: () => void
          let clickPromise = new Promise<void>((resolve) => {
            clickResolve = resolve
          })
          let calendar = initCalendar({
            contentHeight: 500, // make sure the click slot will be in scroll view
            scrollTime: '07:00:00',
            slotMinTime: '02:00:00',
            dateClick(info) {
              expect(info.date instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(false)
              expect(info.date).toEqualDate('2014-05-28T11:00:00Z')
              expect(info.dateStr).toEqual('2014-05-28T11:00:00Z')
              clickResolve()
            },
          })
          await waitTimeout()
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          timeGridWrapper.clickDate('2014-05-28T11:00:00')
          await clickPromise
        })

        // https://github.com/fullcalendar/fullcalendar/issues/4539
        it('fires correctly when clicking on a timed slot NEAR END', async () => {
          let clickResolve: () => void
          let clickPromise = new Promise<void>((resolve) => {
            clickResolve = resolve
          })
          let calendar = initCalendar({
            contentHeight: 500, // make sure the click slot will be in scroll view
            scrollTime: '23:00:00',
            dateClick(info) {
              expect(info.date instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(false)
              expect(info.date).toEqualDate('2014-05-28T23:30:00Z')
              expect(info.dateStr).toEqual('2014-05-28T23:30:00Z')
              clickResolve()
            },
          })
          await waitTimeout()
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
          timeGridWrapper.clickDate('2014-05-28T23:30:00')
          await clickPromise
        })
      })
    })
  })

  it('will still fire if clicked on background event', async () => {
    let clickResolve: () => void
    let clickPromise = new Promise<void>((resolve) => {
      clickResolve = resolve
    })
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      events: [{
        start: '2014-05-06',
        display: 'background',
      }],
      dateClick(info) {
        expect(info.dateStr).toBe('2014-05-06')
        clickResolve()
      },
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    $.simulateMouseClick(dayGridWrapper.getBgEventEls()[0])
    await clickPromise
  })

  describe('when touch', () => {
    it('fires correctly when simulated short drag on a cell', async () => {
      let clickResolve: () => void
      let clickPromise = new Promise<void>((resolve) => {
        clickResolve = resolve
      })
      let calendar = initCalendar({
        dateClick(info) {
          expect(info.date instanceof Date).toEqual(true)
          expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
          expect(typeof info.view).toEqual('object') // "
          expect(info.allDay).toEqual(true)
          expect(info.date).toEqualDate('2014-05-07')
          expect(info.dateStr).toEqual('2014-05-07')
          clickResolve()
        },
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      $.simulateTouchClick(dayGridWrapper.getDayEl('2014-05-07'))
      await clickPromise
    })

    it('won\'t fire if touch moves outside of date cell', async () => {
      let dateClickSpy = spyOnCalendarCallback('dateClick')
      let calendar = initCalendar()
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      let startCell = dayGridWrapper.getDayEl('2014-05-07')
      let endCell = dayGridWrapper.getDayEl('2014-05-08')

      await new Promise<void>((resolve) => {
        $(startCell).simulate('drag', {
          // FYI, when debug:true, not a good representation because the minimal  delay is required
          // to recreate bug #3332
          isTouch: true,
          end: endCell,
          callback() {
            expect(dateClickSpy).not.toHaveBeenCalled()
            resolve()
          },
        })
      })
    })

    it('fires correctly when simulated click on a cell', async () => {
      let clickResolve: () => void
      let clickPromise = new Promise<void>((resolve) => {
        clickResolve = resolve
      })
      let calendar = initCalendar({
        dateClick(info) {
          expect(info.date instanceof Date).toEqual(true)
          expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
          expect(typeof info.view).toEqual('object') // "
          expect(info.allDay).toEqual(true)
          expect(info.date).toEqualDate('2014-05-07')
          expect(info.dateStr).toEqual('2014-05-07')
          clickResolve()
        },
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      let dayCell = dayGridWrapper.getDayEl('2014-05-07')
      $.simulateTouchClick(dayCell)
      await clickPromise
    })
  })
})
