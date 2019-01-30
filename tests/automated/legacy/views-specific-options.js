import { createPlugin } from '@fullcalendar/core'
import DayGridPlugin, { DayGridView } from '@fullcalendar/daygrid'

describe('view-specific options', function() {

  pushOptions({
    header: {
      left: 'prev,next',
      center: 'title',
      right: 'month,dayGridWeek,dayGridDay,week,day'
    },
    defaultView: 'month',
    titleFormat: function() { return 'default' },
    views: { }
  })

  function testEachView(viewsAndVals) {
    $.each(viewsAndVals, function(view, val) {
      currentCalendar.changeView(view)
      expect($('h2')).toHaveText(val)
    })
  }

  it('can target a specific view (month)', function() {
    initCalendar({
      views: {
        month: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      month: 'special!!!',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      week: 'default',
      day: 'default'
    })
  })

  it('can target a specific view (week)', function() {
    initCalendar({
      views: {
        week: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      month: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      week: 'special!!!',
      day: 'default'
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
      month: 'special!!!',
      dayGridWeek: 'special!!!',
      dayGridDay: 'special!!!',
      week: 'default',
      day: 'default'
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
      month: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      week: 'special!!!',
      day: 'special!!!'
    })
  })

  it('can implicitly target a View subclass', function() {

    class SuperDayGridView extends DayGridView {
    }

    initCalendar({
      plugins: [
        DayGridPlugin,
        createPlugin({
          viewConfigs: {
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
      month: 'special!!!',
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
          viewConfigs: {
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
      month: 'special!!!',
      dayGridDay: 'special!!!'
    })
  })

})
