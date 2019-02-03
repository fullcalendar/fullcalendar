import { DayGrid } from '@fullcalendar/daygrid'
import { TimeGrid } from '@fullcalendar/timegrid'
import { ListView } from '@fullcalendar/list'

describe('rerender performance', function() {

  pushOptions({
    defaultDate: '2017-10-04',
    events: [
      { title: 'event 0', start: '2017-10-04' }
    ],
    windowResizeDelay: 0
  })

  ;[
    {
      defaultView: 'dayGridMonth',
      classes: { DayGrid },
      changeToView: 'list' // does not have DayGrid!
    },
    {
      defaultView: 'timeGridWeek',
      classes: { DayGrid, TimeGrid },
      changeToView: 'list' // does not have DayGrid!
    },
    {
      defaultView: 'listWeek',
      classes: { ListView },
      changeToView: 'dayGridMonth'
    }
  ].forEach(function(settings) {

    $.each(settings.classes, function(className, Class) {

      describe('for ' + className + ' in ' + settings.defaultView + ' view', function() {

        it('calls methods a limited number of times', function(done) {
          var calSettings = {
            defaultView: settings.defaultView,
            viewSkeletonRender: function() {},
            datesRender: function() {},
            eventRender: function() {}
          }

          var updateSize = spyOnMethod(Class, 'updateSize') // for the specific initial view
          spyOn(calSettings, 'viewSkeletonRender') // for all views...
          spyOn(calSettings, 'eventRender')
          spyOn(calSettings, 'datesRender')

          initCalendar(calSettings)

          expect(calSettings.viewSkeletonRender.calls.count()).toBe(1)
          expect(calSettings.datesRender.calls.count()).toBe(1)
          expect(calSettings.eventRender.calls.count()).toBe(1)
          expect(updateSize.calls.count()).toBe(1)

          currentCalendar.changeView(settings.changeToView)

          expect(calSettings.viewSkeletonRender.calls.count()).toBe(2) // +1 (switch to new view)
          expect(calSettings.datesRender.calls.count()).toBe(2) // +1 (switch to new view)
          expect(calSettings.eventRender.calls.count()).toBe(2) // +1 (switch to new view)
          expect(updateSize.calls.count()).toBe(1)

          currentCalendar.changeView(settings.defaultView)

          expect(calSettings.viewSkeletonRender.calls.count()).toBe(3) // +1 (switch to new view)
          expect(calSettings.datesRender.calls.count()).toBe(3) // +1 (switch to new view)
          expect(calSettings.eventRender.calls.count()).toBe(3) // +1 (switch to new view)
          expect(updateSize.calls.count()).toBe(2) // +1

          currentCalendar.rerenderEvents()

          expect(calSettings.viewSkeletonRender.calls.count()).toBe(3)
          expect(calSettings.datesRender.calls.count()).toBe(3)
          expect(calSettings.eventRender.calls.count()).toBe(4) // +1
          expect(updateSize.calls.count()).toBe(3) // +1

          $(window).simulate('resize')

          setTimeout(function() {

            expect(calSettings.viewSkeletonRender.calls.count()).toBe(3)
            expect(calSettings.datesRender.calls.count()).toBe(3)
            expect(calSettings.eventRender.calls.count()).toBe(4)
            expect(updateSize.calls.count()).toBe(4) // +1

            updateSize.restore()

            done()
          }, 1) // more than windowResizeDelay
        })
      })
    })
  })
})
