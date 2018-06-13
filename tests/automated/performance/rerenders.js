
// HACK: we know Scheduler introduces an extra rerender :(
const SKIP_RERENDERS = Boolean(FullCalendar.schedulerVersion)
if (SKIP_RERENDERS) {
  console.log('skipping rerenders')
}

// eslint-disable-next-line
SKIP_RERENDERS ||
describe('rerender performance', function() {

  pushOptions({
    defaultDate: '2017-10-04',
    events: [
      { title: 'event 0', start: '2017-10-04' }
    ],
    windowResizeDelay: 0
  });

  [
    {
      classes: [ 'MonthView', 'DayGrid' ],
      defaultView: 'month',
      changeToView: 'list' // does not have DayGrid!
    },
    {
      classes: [ 'AgendaView', 'DayGrid', 'TimeGrid' ],
      defaultView: 'agendaWeek',
      changeToView: 'list' // does not have DayGrid!
    },
    {
      classes: [ 'ListView' ],
      defaultView: 'listWeek',
      changeToView: 'month'
    }
  ].forEach(function(settings) {
    settings.classes.forEach(function(className) {
      describe('for ' + className + ' in ' + settings.defaultView + ' view', function() {
        var Class = FullCalendar[className]

        it('calls methods a limited number of times', function(done) {
          var executeDateRender = spyOnMethod(Class, 'executeDateRender')
          var renderEventRanges = spyOnMethod(Class, 'renderEventRanges')
          var updateSize = spyOnMethod(Class, 'updateSize')

          initCalendar({
            defaultView: settings.defaultView
          })

          expect(executeDateRender.calls.count()).toBe(1)
          expect(renderEventRanges.calls.count()).toBe(1)
          expect(updateSize.calls.count()).toBe(1)

          currentCalendar.changeView(settings.changeToView)

          expect(executeDateRender.calls.count()).toBe(1)
          expect(renderEventRanges.calls.count()).toBe(1)
          expect(updateSize.calls.count()).toBe(2) // +1

          currentCalendar.changeView(settings.defaultView)

          expect(executeDateRender.calls.count()).toBe(2) // +1
          expect(renderEventRanges.calls.count()).toBe(2) // +1
          expect(updateSize.calls.count()).toBe(3) // +1

          currentCalendar.rerenderEvents()

          expect(executeDateRender.calls.count()).toBe(2)
          expect(renderEventRanges.calls.count()).toBe(3) // +1
          expect(updateSize.calls.count()).toBe(5) // +2, TODO: get to just +1

          $(window).simulate('resize')

          setTimeout(function() {

            expect(executeDateRender.calls.count()).toBe(2)
            expect(renderEventRanges.calls.count()).toBe(3)
            expect(updateSize.calls.count()).toBe(6) // +1

            executeDateRender.restore()
            renderEventRanges.restore()
            updateSize.restore()

            done()
          }, 1) // more than windowResizeDelay
        })
      })
    })
  })
})
