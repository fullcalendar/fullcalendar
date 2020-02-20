import { expectActiveRange } from '../lib/ViewDateUtils'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'


describe('changeView', function() {
  pushOptions({
    defaultDate: '2017-06-08',
    defaultView: 'dayGridMonth'
  })

  it('can change views', function() {
    let calendar = initCalendar()
    calendar.changeView('timeGridWeek')
    expectActiveRange('2017-06-04', '2017-06-11')
  })

  it('can change views and navigate date', function() {
    let calendar = initCalendar()
    calendar.changeView('timeGridDay', '2017-06-26')
    expectActiveRange('2017-06-26', '2017-06-27')
  })

  it('can change views and change activeRange', function() {
    let calendar = initCalendar()
    calendar.changeView('timeGrid', {
      start: '2017-07-04',
      end: '2017-07-08'
    })
    expectActiveRange('2017-07-04', '2017-07-08')
  })

  describe('when switching away from view, then back', function() {

    // serves as a smoke test too
    it('correctly renders original view again', function() {
      let calendar = initCalendar({
        defaultView: 'dayGridMonth'
      })

      expect(calendar.view.type).toBe('dayGridMonth')
      checkViewIntegrity(calendar)
      calendar.changeView('timeGridWeek')

      expect(calendar.view.type).toBe('timeGridWeek')
      checkViewIntegrity(calendar)

      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      expect(timeGridWrapper.isStructureValid()).toBe(true)

      calendar.changeView('dayGridWeek')

      expect(calendar.view.type).toBe('dayGridWeek')
      checkViewIntegrity(calendar)
      calendar.changeView('listWeek')

      expect(calendar.view.type).toBe('listWeek')
      checkViewIntegrity(calendar)
      calendar.changeView('dayGridMonth')

      expect(calendar.view.type).toBe('dayGridMonth')
      checkViewIntegrity(calendar)
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/3689
  it('can when switching to/from view while loading events', function(done) {
    let calendar = initCalendar({
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

    calendar.changeView('dayGridDay')
    checkViewIntegrity(calendar)
    expect(calendar.view.type).toBe('dayGridDay')

    setTimeout(function() {
      calendar.changeView('timeGridDay')
      checkViewIntegrity(calendar)
      expect(calendar.view.type).toBe('timeGridDay')
      done()
    }, 200)
  })


  function checkViewIntegrity(calendar) {
    var $el = $(new CalendarWrapper(calendar).getViewEl())
    expect($el).toBeInDOM()
    expect($el.children().length).toBeGreaterThan(0)
    expect($el.text()).toBeTruthy()
  }

})
