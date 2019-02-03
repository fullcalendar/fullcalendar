import { expectActiveRange } from '../view-dates/ViewDateUtils'
import * as TimeGridRenderUtils from '../view-render/TimeGridRenderUtils'


describe('changeView', function() {
  pushOptions({
    defaultDate: '2017-06-08',
    defaultView: 'dayGridMonth'
  })

  it('can change views', function() {
    initCalendar()
    currentCalendar.changeView('timeGridWeek')
    expectActiveRange('2017-06-04', '2017-06-11')
  })

  it('can change views and navigate date', function() {
    initCalendar()
    currentCalendar.changeView('timeGridDay', '2017-06-26')
    expectActiveRange('2017-06-26', '2017-06-27')
  })

  it('can change views and change activeRange', function() {
    initCalendar()
    currentCalendar.changeView('timeGrid', {
      start: '2017-07-04',
      end: '2017-07-08'
    })
    expectActiveRange('2017-07-04', '2017-07-08')
  })

  describe('when switching away from view, then back', function() {

    // serves as a smoke test too
    it('correctly renders original view again', function(done) {
      var renderCalls = 0

      initCalendar({
        defaultView: 'dayGridMonth',
        _eventsPositioned: function(arg) {
          var view = currentCalendar.view

          renderCalls++

          switch (renderCalls) {
            case 1:
              expect(view.type).toBe('dayGridMonth')
              checkViewIntegrity()
              currentCalendar.changeView('timeGridWeek')
              break
            case 2:
              expect(view.type).toBe('timeGridWeek')
              checkViewIntegrity()
              expect(TimeGridRenderUtils.isStructureValid()).toBe(true)
              currentCalendar.changeView('dayGridWeek')
              break
            case 3:
              expect(view.type).toBe('dayGridWeek')
              checkViewIntegrity()
              currentCalendar.changeView('listWeek')
              break
            case 4:
              expect(view.type).toBe('listWeek')
              checkViewIntegrity()
              currentCalendar.changeView('dayGridMonth')
              break
            case 5:
              expect(view.type).toBe('dayGridMonth')
              checkViewIntegrity()
              done()
              break
          }
        }
      })
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/3689
  it('can when switching to/from view while loading events', function(done) {
    initCalendar({
      header: {
        left: 'title dayGridDay timeGridDay'
      },
      defaultView: 'timeGridDay',
      now: '2017-06-08T01:00:00',
      events: function(fetchInfo, successCallback) {
        setTimeout(function() {
          successCallback([ // will run after the first view switch but before the second
            { start: '2017-06-08T01:00:00' } // needs to be timed to cause the JS error
          ])
        }, 100)
      }
    })

    currentCalendar.changeView('dayGridDay')
    checkViewIntegrity()
    expect(currentCalendar.view.type).toBe('dayGridDay')

    setTimeout(function() {
      currentCalendar.changeView('timeGridDay')
      checkViewIntegrity()
      expect(currentCalendar.view.type).toBe('timeGridDay')
      done()
    }, 200)
  })

  function checkViewIntegrity() {
    var $el = $('.fc-view')
    expect($el).toBeInDOM()
    expect($el.children().length).toBeGreaterThan(0)
    expect($el.text()).toBeTruthy()
    expect(
      $el.find('[data-date]').length +
      $el.find('.fc-list-empty').length
    ).toBeGreaterThan(0)
  }
})
