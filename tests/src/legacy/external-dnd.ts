import { Calendar } from '@fullcalendar/core'
import interactionPlugin, { ThirdPartyDraggable } from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { ListenerCounter } from '../lib/ListenerCounter.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('external drag and drop with jquery UI', () => {
  pushOptions({
    plugins: [interactionPlugin, timeGridPlugin, dayGridPlugin],
    initialDate: '2014-08-23',
    initialView: 'dayGridMonth',
    droppable: true,
  })

  // TODO: fill out tests for droppable/drop, with RTL

  let thirdPartyDraggable

  beforeEach(() => {
    $('body').append(
      '<div id="sidebar" style="width:200px">' +
        `<a class="${CalendarWrapper.EVENT_CLASSNAME} event1">event 1</a>` +
        `<a class="${CalendarWrapper.EVENT_CLASSNAME} event2">event 2</a>` +
      '</div>' +
      '<div id="cal" style="width:600px;position:absolute;top:10px;left:220px" />',
    )

    thirdPartyDraggable = new ThirdPartyDraggable({
      itemSelector: `#sidebar .${CalendarWrapper.EVENT_CLASSNAME}`,
    })
  })

  afterEach(() => {
    $('#sidebar').remove()
    $('#cal').remove()
    thirdPartyDraggable.destroy()
  })

  function initCalendarInContainer(options = {}) {
    return initCalendar(options, $('#cal')[0])
  }

  describeValues({
    'with draggable': () => $('#sidebar a').draggable(),
    'with sortable': () => $('#sidebar').sortable(),
  }, (initDnd) => {
    describe('in month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
      })

      it('works after the view is changed', (done) => { // issue 2240
        let callCnt = 0
        let dayGridWrapper
        let calendar = initCalendarInContainer({
          drop(arg) {
            if (callCnt === 0) {
              expect(arg.date).toEqualDate('2014-08-06')

              calendar.next()
              calendar.prev()

              setTimeout(() => { // weird
                $('#sidebar .event1').remove()
                $('#sidebar .event2').simulate('drag', {
                  end: dayGridWrapper.getDayEl('2014-08-06'),
                })
              }, 0)
            } else if (callCnt === 1) {
              expect(arg.date).toEqualDate('2014-08-06')
              setTimeout(done) // weird
            }

            callCnt += 1
          },
        })
        dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        initDnd()
        setTimeout(() => { // weird
          $('#sidebar .event1').simulate('drag', {
            end: dayGridWrapper.getDayEl('2014-08-06'),
          })
        })
      })

      describe('dropAccept', () => {
        it('works with a className that does match', (done) => {
          let options = {
            dropAccept: '.event1',
            drop() { },
          }
          spyOn(options, 'drop').and.callThrough()

          let calendar = initCalendarInContainer(options)
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          initDnd()
          setTimeout(() => { // weird
            $('#sidebar .event1').simulate('drag', {
              end: dayGridWrapper.getDayEl('2014-08-06'),
              callback() {
                expect(options.drop).toHaveBeenCalled()
                done()
              },
            })
          })
        })

        it('prevents a classNames that doesn\'t match', (done) => {
          let options = {
            dropAccept: '.event2',
            drop() { },
          }
          spyOn(options, 'drop').and.callThrough()

          let calendar = initCalendarInContainer(options)
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          initDnd()
          setTimeout(() => { // weird
            $('#sidebar .event1').simulate('drag', {
              end: dayGridWrapper.getDayEl('2014-08-06'),
              callback() {
                expect(options.drop).not.toHaveBeenCalled()
                done()
              },
            })
          })
        })

        it('works with a filter function that returns true', (done) => {
          let options = {
            dropAccept(el) {
              expect(el instanceof HTMLElement).toBe(true)
              return true
            },
            drop() { },
          }
          spyOn(options, 'drop').and.callThrough()

          let calendar = initCalendarInContainer(options)
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          initDnd()
          setTimeout(() => { // weird
            $('#sidebar .event1').simulate('drag', {
              end: dayGridWrapper.getDayEl('2014-08-06'),
              callback() {
                expect(options.drop).toHaveBeenCalled()
                done()
              },
            })
          })
        })

        it('prevents a drop with a filter function that returns false', (done) => {
          let options = {
            dropAccept(el) {
              expect(el instanceof HTMLElement).toBe(true)
              return false
            },
            drop() { },
          }
          spyOn(options, 'drop').and.callThrough()

          let calendar = initCalendarInContainer(options)
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          initDnd()
          setTimeout(() => { // weird
            $('#sidebar .event1').simulate('drag', {
              end: dayGridWrapper.getDayEl('2014-08-06'),
              callback() {
                expect(options.drop).not.toHaveBeenCalled()
                done()
              },
            })
          })
        })
      })
    })

    describe('in timeGrid view', () => {
      pushOptions({
        initialView: 'timeGridWeek',
        dragScroll: false,
        scrollTime: '00:00:00',
      })

      it('works after the view is changed', (done) => {
        let callCnt = 0
        let timeGridWrapper
        let calendar = initCalendarInContainer({
          drop(arg) {
            if (callCnt === 0) {
              expect(arg.date).toEqualDate('2014-08-20T01:00:00Z')

              currentCalendar.next()
              currentCalendar.prev()

              setTimeout(() => { // weird
                $('#sidebar .event1').remove()
                $('#sidebar .event2').simulate('drag', {
                  end: timeGridWrapper.getPoint('2014-08-20T01:00:00'),
                })
              }, 0)
            } else if (callCnt === 1) {
              expect(arg.date).toEqualDate('2014-08-20T01:00:00Z')
              setTimeout(done) // weird
            }

            callCnt += 1
          },
        })
        timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        initDnd()
        setTimeout(() => { // weird
          $('#sidebar .event1').simulate('drag', {
            end: timeGridWrapper.getPoint('2014-08-20T01:00:00'),
          })
        })
      })

      it('works with timezone as "local"', (done) => { // for issue 2225
        let calendar = initCalendarInContainer({
          timeZone: 'local',
          drop(arg) {
            expect(arg.date).toEqualLocalDate('2014-08-20T01:00:00')
            done()
          },
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        initDnd()
        setTimeout(() => {
          $('#sidebar .event1').simulate('drag', {
            end: timeGridWrapper.getPoint('2014-08-20T01:00:00'),
          })
        })
      })

      it('works with timezone as "UTC"', (done) => { // for issue 2225
        let calendar = initCalendarInContainer({
          timeZone: 'UTC',
          drop(arg) {
            expect(arg.date).toEqualDate('2014-08-20T01:00:00Z')
            done()
          },
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

        initDnd()
        setTimeout(() => { // weird
          $('#sidebar .event1').simulate('drag', {
            end: timeGridWrapper.getPoint('2014-08-20T01:00:00'),
          })
        })
      })

      describe('dropAccept', () => {
        it('works with a className that does match', (done) => {
          let options = {
            dropAccept: '.event1',
            drop() { },
          }
          spyOn(options, 'drop').and.callThrough()

          let calendar = initCalendarInContainer(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          initDnd()
          setTimeout(() => { // weird
            $('#sidebar .event1').simulate('drag', {
              end: timeGridWrapper.getPoint('2014-08-20T01:00:00'),
              callback() {
                expect(options.drop).toHaveBeenCalled()
                done()
              },
            })
          })
        })

        it('prevents a classNames that doesn\'t match', (done) => {
          let options = {
            dropAccept: '.event2',
            drop() { },
          }
          spyOn(options, 'drop').and.callThrough()

          let calendar = initCalendarInContainer(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          initDnd()
          setTimeout(() => { // weird
            $('#sidebar .event1').simulate('drag', {
              end: timeGridWrapper.getPoint('2014-08-20T01:00:00'),
              callback() {
                expect(options.drop).not.toHaveBeenCalled()
                done()
              },
            })
          })
        })

        it('works with a filter function that returns true', (done) => {
          let options = {
            dropAccept(el) {
              expect(el instanceof HTMLElement).toBe(true)
              return true
            },
            drop() { },
          }
          spyOn(options, 'drop').and.callThrough()

          let calendar = initCalendarInContainer(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          initDnd()
          setTimeout(() => { // weird
            $('#sidebar .event1').simulate('drag', {
              end: timeGridWrapper.getPoint('2014-08-20T01:00:00'),
              callback() {
                expect(options.drop).toHaveBeenCalled()
                done()
              },
            })
          })
        })

        it('prevents a drop with a filter function that returns false', (done) => {
          let options = {
            dropAccept(el) {
              expect(el instanceof HTMLElement).toBe(true)
              return false
            },
            drop() { },
          }
          spyOn(options, 'drop').and.callThrough()

          let calendar = initCalendarInContainer(options)
          let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

          initDnd()
          setTimeout(() => { // weird
            $('#sidebar .event1').simulate('drag', {
              end: timeGridWrapper.getPoint('2014-08-20T01:00:00'),
              callback() {
                expect(options.drop).not.toHaveBeenCalled()
                done()
              },
            })
          })
        })
      })
    })

    // Issue 2433
    it('should not have drag handlers cleared when other calendar navigates', () => {
      let calendar0 = initCalendarInContainer()
      initDnd()

      let el0 = calendar0.el
      let $el1 = $('<div id="calendar2">').insertAfter(el0)
      let calendar1 = new Calendar($el1[0], getCurrentOptions())
      calendar1.render()

      let docListenerCounter = new ListenerCounter(document)
      docListenerCounter.startWatching()

      calendar0.next()
      expect(docListenerCounter.stopWatching()).toBe(0)

      calendar1.destroy()
      $el1.remove()
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/2926
  it('gives a mouseup event to the drop handler', (done) => {
    let options = {
      drop(info) {
        expect(info.jsEvent.type).toBe('mouseup')
      },
    }
    spyOn(options, 'drop').and.callThrough()

    let calendar = initCalendarInContainer(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    setTimeout(() => { // weird
      $('#sidebar .event1').draggable().simulate('drag', {
        end: dayGridWrapper.getDayEl('2014-08-06'),
        callback() {
          expect(options.drop).toHaveBeenCalled()
          done()
        },
      })
    })
  })
})
