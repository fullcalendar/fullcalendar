
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
      defaultView: 'month',
      classes: [
        { name: 'BasicView', dateMethod: 'renderDates', eventMethod: 'renderEvents' },
        { name: 'DayGrid', dateMethod: 'renderCells', eventMethod: 'renderEventSegs' }
      ],
      changeToView: 'list' // does not have DayGrid!
    },
    {
      defaultView: 'agendaWeek',
      classes: [
        { name: 'AgendaView', dateMethod: 'renderDates', eventMethod: 'renderEvents' },
        { name: 'DayGrid', dateMethod: 'renderCells', eventMethod: 'renderEventSegs' },
        { name: 'TimeGrid', dateMethod: 'renderColumns', eventMethod: 'renderEventSegs' }
      ],
      changeToView: 'list' // does not have DayGrid!
    },
    {
      defaultView: 'listWeek',
      classes: [
        { name: 'ListView', dateMethod: 'renderDates', eventMethod: 'renderEvents' },
      ],
      changeToView: 'month'
    }
  ].forEach(function(settings) {
    settings.classes.forEach(function(classInfo) {
      describe('for ' + classInfo.name + ' in ' + settings.defaultView + ' view', function() {
        var Class = FullCalendar[classInfo.name]

        it('calls methods a limited number of times', function(done) {
          var renderDates = spyOnMethod(Class, classInfo.dateMethod)
          var renderEvents = spyOnMethod(Class, classInfo.eventMethod)
          var updateSize = spyOnMethod(Class, 'updateSize')

          initCalendar({
            defaultView: settings.defaultView
          })

          expect(renderDates.calls.count()).toBe(1)
          expect(renderEvents.calls.count()).toBe(1)
          expect(updateSize.calls.count()).toBe(1)

          currentCalendar.changeView(settings.changeToView)

          expect(renderDates.calls.count()).toBe(1)
          expect(renderEvents.calls.count()).toBe(1)
          expect(updateSize.calls.count()).toBe(1)

          currentCalendar.changeView(settings.defaultView)

          expect(renderDates.calls.count()).toBe(2) // +1
          expect(renderEvents.calls.count()).toBe(2) // +1
          expect(updateSize.calls.count()).toBe(2) // +1

          currentCalendar.rerenderEvents()

          expect(renderDates.calls.count()).toBe(2)
          expect(renderEvents.calls.count()).toBe(3) // +1
          expect(updateSize.calls.count()).toBe(3) // +1

          $(window).simulate('resize')

          setTimeout(function() {

            expect(renderDates.calls.count()).toBe(2)
            expect(renderEvents.calls.count()).toBe(3)
            expect(updateSize.calls.count()).toBe(4) // +1

            renderDates.restore()
            renderEvents.restore()
            updateSize.restore()

            done()
          }, 1) // more than windowResizeDelay
        })
      })
    })
  })
})
