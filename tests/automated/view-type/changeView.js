import { expectActiveRange } from '../view-dates/ViewDateUtils'
import * as TimeGridRenderUtils from '../view-render/TimeGridRenderUtils'


describe('changeView', function() {
  pushOptions({
    defaultDate: '2017-06-08',
    defaultView: 'month'
  })

  it('can change views', function() {
    initCalendar()
    currentCalendar.changeView('agendaWeek')
    expectActiveRange('2017-06-04', '2017-06-11')
  })

  it('can change views and navigate date', function() {
    initCalendar()
    currentCalendar.changeView('agendaDay', '2017-06-26')
    expectActiveRange('2017-06-26', '2017-06-27')
  })

  it('can change views and change activeRange', function() {
    initCalendar()
    currentCalendar.changeView('agenda', {
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
        defaultView: 'month',
        eventAfterAllRender: function(view) {
          renderCalls++

          switch (renderCalls) {
            case 1:
              expect(view.type).toBe('month')
              checkViewIntegrity()
              currentCalendar.changeView('agendaWeek')
              break
            case 2:
              expect(view.type).toBe('agendaWeek')
              checkViewIntegrity()
              expect(TimeGridRenderUtils.isStructureValid()).toBe(true)
              currentCalendar.changeView('basicWeek')
              break
            case 3:
              expect(view.type).toBe('basicWeek')
              checkViewIntegrity()
              currentCalendar.changeView('listWeek')
              break
            case 4:
              expect(view.type).toBe('listWeek')
              checkViewIntegrity()
              currentCalendar.changeView('month')
              break
            case 5:
              expect(view.type).toBe('month')
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
        left: 'title basicDay agendaDay'
      },
      defaultView: 'agendaDay',
      now: '2017-06-08T01:00:00',
      events: function(start, end, timezone, callback) {
        setTimeout(function() {
          callback([ // will run after the first view switch but before the second
            { start: '2017-06-08T01:00:00' } // needs to be timed to cause the JS error
          ])
        }, 100)
      }
    })

    currentCalendar.changeView('basicDay')
    checkViewIntegrity()
    expect(currentCalendar.getView().type).toBe('basicDay')

    setTimeout(function() {
      currentCalendar.changeView('agendaDay')
      checkViewIntegrity()
      expect(currentCalendar.getView().type).toBe('agendaDay')
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
