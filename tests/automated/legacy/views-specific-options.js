import { createPlugin } from '@fullcalendar/core'
import DayGridPlugin, { DayGridView } from '@fullcalendar/daygrid'

describe('view-specific options', function() {

  pushOptions({
    header: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay,timeGridWeek,timeGridDay'
    },
    defaultView: 'dayGridMonth',
    titleFormat: function() { return 'default' },
    views: { }
  })

  function testEachView(viewsAndVals) {
    $.each(viewsAndVals, function(view, val) {
      currentCalendar.changeView(view)
      expect($('h2')).toHaveText(val)
    })
  }

  it('can target a specific view (dayGridMonth)', function() {
    initCalendar({
      views: {
        dayGridMonth: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      dayGridMonth: 'special!!!',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'default',
      timeGridDay: 'default'
    })
  })

  it('can target a specific view (timeGridWeek)', function() {
    initCalendar({
      views: {
        timeGridWeek: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'default'
    })
  })

  it('can target dayGrid views', function() {
    initCalendar({
      views: {
        dayGrid: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      dayGridMonth: 'special!!!',
      dayGridWeek: 'special!!!',
      dayGridDay: 'special!!!',
      timeGridWeek: 'default',
      timeGridDay: 'default'
    })
  })

  it('can target timeGrid views', function() {
    initCalendar({
      views: {
        timeGrid: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'special!!!'
    })
  })

  it('can target week views', function() {
    initCalendar({
      views: {
        week: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      dayGridMonth: 'default',
      dayGridWeek: 'special!!!',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'default'
    })
  })

  it('can target day views', function() {
    initCalendar({
      views: {
        day: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'special!!!',
      timeGridWeek: 'default',
      timeGridDay: 'special!!!'
    })
  })

  it('can implicitly target a View subclass', function() {

    class SuperDayGridView extends DayGridView {
    }

    initCalendar({
      plugins: [
        DayGridPlugin,
        createPlugin({
          views: {
            superBasic: SuperDayGridView
          }
        })
      ],
      views: {
        dayGrid: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })

    testEachView({
      superBasic: 'special!!!',
      dayGridMonth: 'special!!!',
      dayGridDay: 'special!!!'
    })
  })

  it('can implicitly target an old-school View subclass', function() {

    function SuperDayGridView() { DayGridView.apply(this, arguments) }
    SuperDayGridView.prototype = Object.create(DayGridView.prototype)

    initCalendar({
      plugins: [
        DayGridPlugin,
        createPlugin({
          views: {
            superBasic: SuperDayGridView
          }
        })
      ],
      views: {
        dayGrid: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })

    testEachView({
      superBasic: 'special!!!',
      dayGridMonth: 'special!!!',
      dayGridDay: 'special!!!'
    })
  })

})
