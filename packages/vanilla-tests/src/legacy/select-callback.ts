import { Calendar } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import dayGridPlugin from 'fullcalendar/daygrid'
import interactionPlugin from 'fullcalendar/interaction'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { waitDateSelect } from '../lib/wrappers/interaction-util'
import { waitTimeout } from '../lib/misc'

// UNFORTUNATELY, these tests are affected by the window height b/c of autoscrolling

describe('select callback', () => {
  pushOptions({
    initialDate: '2014-05-25',
    selectable: true,
    longPressDelay: 100,
  })

  describeOptions('direction', {
    'when LTR': 'ltr',
    'when RTL': 'rtl',
  }, () => {
    describe('when in month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
      })

      it('gets fired correctly when the user selects cells', async () => {
        let options = {
          select(info) {
            expect(info.start instanceof Date).toEqual(true)
            expect(info.end instanceof Date).toEqual(true)
            expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
            expect(typeof info.view).toEqual('object') // "
            expect(info.allDay).toEqual(true)
            expect(info.start).toEqualDate('2014-04-28')
            expect(info.startStr).toEqual('2014-04-28')
            expect(info.end).toEqualDate('2014-05-07')
            expect(info.endStr).toEqual('2014-05-07')
          },
        }
        spyOn(options, 'select').and.callThrough()

        let calendar = initCalendar(options)
        await waitTimeout()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        await dayGridWrapper.selectDates('2014-04-28', '2014-05-06')
        expect(options.select).toHaveBeenCalled()
      })

      it('gets fired correctly when the user selects cells via touch', async () => {
        let options = {
          select(info) {
            expect(info.start instanceof Date).toEqual(true)
            expect(info.end instanceof Date).toEqual(true)
            expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
            expect(typeof info.view).toEqual('object') // "
            expect(info.allDay).toEqual(true)
            expect(info.start).toEqualDate('2014-04-28')
            expect(info.startStr).toEqual('2014-04-28')
            expect(info.end).toEqualDate('2014-05-07')
            expect(info.endStr).toEqual('2014-05-07')
          },
        }
        spyOn(options, 'select').and.callThrough()

        let calendar = initCalendar(options)
        await waitTimeout()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        let selectInfo = await waitDateSelect(calendar, dayGridWrapper.selectDatesTouch(
          '2014-04-28',
          '2014-05-06',
        ))

        expect(selectInfo).not.toBe(false)
        expect(options.select).toHaveBeenCalled()
      })

      it('gets fired correctly when the user selects just one cell', async () => {
        let options = {
          select(info) {
            expect(info.start instanceof Date).toEqual(true)
            expect(info.end instanceof Date).toEqual(true)
            expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
            expect(typeof info.view).toEqual('object') // "
            expect(info.allDay).toEqual(true)
            expect(info.start).toEqualDate('2014-04-28')
            expect(info.startStr).toEqual('2014-04-28')
            expect(info.end).toEqualDate('2014-04-29')
            expect(info.endStr).toEqual('2014-04-29')
          },
        }
        spyOn(options, 'select').and.callThrough()

        let calendar = initCalendar(options)
        await waitTimeout()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        await dayGridWrapper.selectDates('2014-04-28', '2014-04-28')
        expect(options.select).toHaveBeenCalled()
      })
    })

    describe('when in week view', () => {
      pushOptions({
        initialView: 'timeGridWeek',
      })

      describe('when selecting all-day slots', () => {
        it('gets fired correctly when the user selects cells', async () => {
          let options = {
            select(info) {
              expect(info.start instanceof Date).toEqual(true)
              expect(info.end instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(true)
              expect(info.start).toEqualDate('2014-05-28')
              expect(info.startStr).toEqual('2014-05-28')
              expect(info.end).toEqualDate('2014-05-30')
              expect(info.endStr).toEqual('2014-05-30')
            },
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          await waitTimeout()
          let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid

          await dayGridWrapper.selectDates('2014-05-28', '2014-05-29')
          expect(options.select).toHaveBeenCalled()
        })

        it('gets fired correctly when the user selects a single cell', async () => {
          let options = {
            select(info) {
              expect(info.start instanceof Date).toEqual(true)
              expect(info.end instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(true)
              expect(info.start).toEqualDate('2014-05-28')
              expect(info.startStr).toEqual('2014-05-28')
              expect(info.end).toEqualDate('2014-05-29')
              expect(info.endStr).toEqual('2014-05-29')
            },
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          await waitTimeout()
          let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid

          await dayGridWrapper.selectDates('2014-05-28', '2014-05-28')
          expect(options.select).toHaveBeenCalled()
        })
      })

      describe('when selecting timed slots', () => {
        it('gets fired correctly when the user selects slots', async () => {
          let options = {
            select(info) {
              expect(info.start instanceof Date).toEqual(true)
              expect(info.end instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(false)
              expect(info.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(info.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(info.end).toEqualDate('2014-05-28T10:30:00Z')
              expect(info.endStr).toEqual('2014-05-28T10:30:00Z')
            },
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          await waitTimeout()
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          await timeGridWrapper.selectDates('2014-05-28T09:00:00', '2014-05-28T10:30:00')
          expect(options.select).toHaveBeenCalled()
        })

        // https://github.com/fullcalendar/fullcalendar/issues/4505
        it('gets fired correctly when the user selects slots NEAR THE END', async () => {
          let options = {
            scrollTime: '24:00',
            select(info) {
              expect(info.start).toEqualDate('2014-05-28T16:00:00Z')
              expect(info.end).toEqualDate('2014-05-29T00:00:00Z')
            },
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          await waitTimeout()
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          await timeGridWrapper.selectDates('2014-05-28T16:00:00', '2014-05-29T00:00:00')
          expect(options.select).toHaveBeenCalled()
        })

        it('gets fired correctly when the user selects slots via touch', async () => {
          let options = {
            select(info) {
              expect(info.start instanceof Date).toEqual(true)
              expect(info.end instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(false)
              expect(info.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(info.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(info.end).toEqualDate('2014-05-28T10:30:00Z')
              expect(info.endStr).toEqual('2014-05-28T10:30:00Z')
            },
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          await waitTimeout()
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          await waitTimeout(100) // HACK: sometimes touch dragging wouldn't grab onto anything
          let selectInfo = await waitDateSelect(calendar, timeGridWrapper.selectDatesTouch(
            '2014-05-28T09:00:00',
            '2014-05-28T10:30:00',
          ))

          expect(selectInfo).not.toBe(false)
          expect(options.select).toHaveBeenCalled()
        })

        it('gets fired correctly when the user selects slots in a different day', async () => {
          let options = {
            select(info) {
              expect(info.start instanceof Date).toEqual(true)
              expect(info.end instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(false)
              expect(info.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(info.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(info.end).toEqualDate('2014-05-29T10:30:00Z')
              expect(info.endStr).toEqual('2014-05-29T10:30:00Z')
            },
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          await waitTimeout()
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          await timeGridWrapper.selectDates('2014-05-28T09:00:00', '2014-05-29T10:30:00')
          expect(options.select).toHaveBeenCalled()
        })

        it('gets fired correctly when the user selects a single slot', async () => {
          let options = {
            select(info) {
              expect(info.start instanceof Date).toEqual(true)
              expect(info.end instanceof Date).toEqual(true)
              expect(typeof info.jsEvent).toEqual('object') // TODO: more discrimination
              expect(typeof info.view).toEqual('object') // "
              expect(info.allDay).toEqual(false)
              expect(info.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(info.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(info.end).toEqualDate('2014-05-28T09:30:00Z')
              expect(info.endStr).toEqual('2014-05-28T09:30:00Z')
            },
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          await waitTimeout()
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          await timeGridWrapper.selectDates('2014-05-28T09:00:00', '2014-05-28T09:30:00')
          expect(options.select).toHaveBeenCalled()
        })
      })
    })
  })

  describe('when selectMinDistance', () => {
    pushOptions({
      selectMinDistance: 10,
    })

    it('will fire when dragged beyond distance', async () => {
      let options = {
        select() {},
      }
      spyOn(options, 'select').and.callThrough()

      let calendar = initCalendar(options)
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      await new Promise<void>((resolve) => {
        $(dayGridWrapper.getDayEl('2014-04-28')).simulate('drag', {
          dx: 12,
          dy: 0,
          callback() {
            expect(options.select).toHaveBeenCalled()
            resolve()
          },
        })
      })
    })

    it('will not fire when not dragged beyond distance', async () => {
      let options = {
        select() {},
      }
      spyOn(options, 'select').and.callThrough()

      let calendar = initCalendar(options)
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      await new Promise<void>((resolve) => {
        $(dayGridWrapper.getDayEl('2014-04-28')).simulate('drag', {
          dx: 8,
          dy: 0,
          callback() {
            expect(options.select).not.toHaveBeenCalled()
            resolve()
          },
        })
      })
    })
  })

  it('will fire on a calendar that hasn\'t been rendered yet', (done) => {
    let calendar = new Calendar(
      document.createElement('div'),
      {
        plugins: [interactionPlugin, dayGridPlugin, classicThemePlugin, themeForTestsPlugin],
        now: '2018-12-25',
        select(info) {
          expect(info.startStr).toBe('2018-12-20')
          expect(info.endStr).toBe('2018-12-23')
          done()
        },
      },
    )

    calendar.select('2018-12-20', '2018-12-23')
  })
})
