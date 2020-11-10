import { createPlugin } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

describe('view-specific options', function() {

  pushOptions({
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    titleFormat: function() { return 'default' },
    views: { }
  })

  function testEachView(viewsAndVals) {
    $.each(viewsAndVals, function(view: string, val) {
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

  it('views that explicitly extend others inherit options', function() {
    initCalendar({
      plugins: [
        dayGridPlugin,
        createPlugin({
          views: {
            superBasic: {
              type: 'dayGrid', // explicitly extend
              content: 'hello world'
            }
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
