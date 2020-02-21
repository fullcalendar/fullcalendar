import { Calendar } from '@fullcalendar/core'
import DayGridPlugin from '@fullcalendar/daygrid'
import InteractionPlugin from '@fullcalendar/interaction'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('select callback', function() {
  pushOptions({
    defaultDate: '2014-05-25',
    selectable: true,
    longPressDelay: 100
  })

  describeOptions('dir', {
    'when LTR': 'ltr',
    'when RTL': 'rtl'
  }, function() {

    describe('when in month view', function() {
      pushOptions({
        defaultView: 'dayGridMonth'
      })

      it('gets fired correctly when the user selects cells', function(done) {
        let options = {
          select(arg) {
            expect(arg.start instanceof Date).toEqual(true)
            expect(arg.end instanceof Date).toEqual(true)
            expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
            expect(typeof arg.view).toEqual('object') // "
            expect(arg.allDay).toEqual(true)
            expect(arg.start).toEqualDate('2014-04-28')
            expect(arg.startStr).toEqual('2014-04-28')
            expect(arg.end).toEqualDate('2014-05-07')
            expect(arg.endStr).toEqual('2014-05-07')
          }
        }
        spyOn(options, 'select').and.callThrough()

        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.selectDates('2014-04-28', '2014-05-06').then(() => {
          expect(options.select).toHaveBeenCalled()
          done()
        })
      })

      it('gets fired correctly when the user selects cells via touch', function(done) {
        let options = {
          select(arg) {
            expect(arg.start instanceof Date).toEqual(true)
            expect(arg.end instanceof Date).toEqual(true)
            expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
            expect(typeof arg.view).toEqual('object') // "
            expect(arg.allDay).toEqual(true)
            expect(arg.start).toEqualDate('2014-04-28')
            expect(arg.startStr).toEqual('2014-04-28')
            expect(arg.end).toEqualDate('2014-05-07')
            expect(arg.endStr).toEqual('2014-05-07')
          }
        }
        spyOn(options, 'select').and.callThrough()

        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.selectDatesTouch('2014-04-28', '2014-05-06').then(() => {
          expect(options.select).toHaveBeenCalled()
          done()
        })
      })

      it('gets fired correctly when the user selects just one cell', function(done) {
        let options = {
          select(arg) {
            expect(arg.start instanceof Date).toEqual(true)
            expect(arg.end instanceof Date).toEqual(true)
            expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
            expect(typeof arg.view).toEqual('object') // "
            expect(arg.allDay).toEqual(true)
            expect(arg.start).toEqualDate('2014-04-28')
            expect(arg.startStr).toEqual('2014-04-28')
            expect(arg.end).toEqualDate('2014-04-29')
            expect(arg.endStr).toEqual('2014-04-29')
          }
        }
        spyOn(options, 'select').and.callThrough()

        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.selectDates('2014-04-28', '2014-04-28').then(() => {
          expect(options.select).toHaveBeenCalled()
          done()
        })
      })
    })

    describe('when in week view', function() {
      pushOptions({
        defaultView: 'timeGridWeek'
      })

      describe('when selecting all-day slots', function() {

        it('gets fired correctly when the user selects cells', function(done) {
          let options = {
            select(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(true)
              expect(arg.start).toEqualDate('2014-05-28')
              expect(arg.startStr).toEqual('2014-05-28')
              expect(arg.end).toEqualDate('2014-05-30')
              expect(arg.endStr).toEqual('2014-05-30')
            }
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid

          dayGridWrapper.selectDates('2014-05-28', '2014-05-29').then(() => {
            expect(options.select).toHaveBeenCalled()
            done()
          })
        })

        it('gets fired correctly when the user selects a single cell', function(done) {
          let options = {
            select(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(true)
              expect(arg.start).toEqualDate('2014-05-28')
              expect(arg.startStr).toEqual('2014-05-28')
              expect(arg.end).toEqualDate('2014-05-29')
              expect(arg.endStr).toEqual('2014-05-29')
            }
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid

          dayGridWrapper.selectDates('2014-05-28', '2014-05-28').then(() => {
            expect(options.select).toHaveBeenCalled()
            done()
          })
        })
      })

      describe('when selecting timed slots', function() {

        it('gets fired correctly when the user selects slots', function(done) {
          let options = {
            select(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(arg.end).toEqualDate('2014-05-28T10:30:00Z')
              expect(arg.endStr).toEqual('2014-05-28T10:30:00Z')
            }
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          timeGridWrapper.selectDates('2014-05-28T09:00:00', '2014-05-28T10:30:00').then(() => {
            expect(options.select).toHaveBeenCalled()
            done()
          })
        })

        // https://github.com/fullcalendar/fullcalendar/issues/4505
        it('gets fired correctly when the user selects slots NEAR THE END', function(done) {
          let options = {
            scrollTime: '24:00',
            select(arg) {
              expect(arg.start).toEqualDate('2014-05-28T16:00:00Z')
              expect(arg.end).toEqualDate('2014-05-29T00:00:00Z')
            }
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          timeGridWrapper.selectDates('2014-05-28T16:00:00', '2014-05-29T00:00:00').then(() => {
            expect(options.select).toHaveBeenCalled()
            done()
          })
        })

        it('gets fired correctly when the user selects slots via touch', function(done) {
          let options = {
            select(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(arg.end).toEqualDate('2014-05-28T10:30:00Z')
              expect(arg.endStr).toEqual('2014-05-28T10:30:00Z')
            }
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          timeGridWrapper.selectDatesTouch('2014-05-28T09:00:00', '2014-05-28T10:30:00').then(() => {
            expect(options.select).toHaveBeenCalled()
            done()
          })
        })

        it('gets fired correctly when the user selects slots in a different day', function(done) {
          let options = {
            select(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(arg.end).toEqualDate('2014-05-29T10:30:00Z')
              expect(arg.endStr).toEqual('2014-05-29T10:30:00Z')
            }
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          timeGridWrapper.selectDates('2014-05-28T09:00:00', '2014-05-29T10:30:00').then(() => {
            expect(options.select).toHaveBeenCalled()
            done()
          })
        })

        it('gets fired correctly when the user selects a single slot', function(done) {
          let options = {
            select(arg) {
              expect(arg.start instanceof Date).toEqual(true)
              expect(arg.end instanceof Date).toEqual(true)
              expect(typeof arg.jsEvent).toEqual('object') // TODO: more descrimination
              expect(typeof arg.view).toEqual('object') // "
              expect(arg.allDay).toEqual(false)
              expect(arg.start).toEqualDate('2014-05-28T09:00:00Z')
              expect(arg.startStr).toEqual('2014-05-28T09:00:00Z')
              expect(arg.end).toEqualDate('2014-05-28T09:30:00Z')
              expect(arg.endStr).toEqual('2014-05-28T09:30:00Z')
            }
          }
          spyOn(options, 'select').and.callThrough()

          let calendar = initCalendar(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          timeGridWrapper.selectDates('2014-05-28T09:00:00', '2014-05-28T09:30:00').then(() => {
            expect(options.select).toHaveBeenCalled()
            done()
          })
        })
      })
    })
  })

  describe('when selectMinDistance', function() {
    pushOptions({
      selectMinDistance: 10
    })

    it('will fire when dragged beyond distance', function(done) {
      let options = {
        select() {}
      }
      spyOn(options, 'select').and.callThrough()

      let calendar = initCalendar(options)
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      $(dayGridWrapper.getDayEl('2014-04-28')).simulate('drag', {
        dx: 12,
        dy: 0,
        callback: function() {
          expect(options.select).toHaveBeenCalled()
          done()
        }
      })
    })

    it('will not fire when not dragged beyond distance', function(done) {
      let options = {
        select() {}
      }
      spyOn(options, 'select').and.callThrough()

      let calendar = initCalendar(options)
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      $(dayGridWrapper.getDayEl('2014-04-28')).simulate('drag', {
        dx: 8,
        dy: 0,
        callback: function() {
          expect(options.select).not.toHaveBeenCalled()
          done()
        }
      })
    })
  })

  it('will fire on a calendar that hasn\'t been rendered yet', function(done) {
    let calendar = new Calendar(
      document.createElement('div'),
      {
        plugins: [ InteractionPlugin, DayGridPlugin ],
        now: '2018-12-25',
        select: function(info) {
          expect(info.startStr).toBe('2018-12-20')
          expect(info.endStr).toBe('2018-12-23')
          done()
        }
      }
    )

    calendar.select('2018-12-20', '2018-12-23')
  })
})
