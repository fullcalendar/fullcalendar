describe('view-specific options', function() {

  pushOptions({
    header: {
      left: 'prev,next',
      center: 'title',
      right: 'month,basicWeek,basicDay,agendaWeek,agendaDay'
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
      basicWeek: 'default',
      basicDay: 'default',
      agendaWeek: 'default',
      agendaDay: 'default'
    })
  })

  it('can target a specific view (agendaWeek)', function() {
    initCalendar({
      views: {
        agendaWeek: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      month: 'default',
      basicWeek: 'default',
      basicDay: 'default',
      agendaWeek: 'special!!!',
      agendaDay: 'default'
    })
  })

  it('can target basic views', function() {
    initCalendar({
      views: {
        basic: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      month: 'special!!!',
      basicWeek: 'special!!!',
      basicDay: 'special!!!',
      agendaWeek: 'default',
      agendaDay: 'default'
    })
  })

  it('can target agenda views', function() {
    initCalendar({
      views: {
        agenda: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })
    testEachView({
      month: 'default',
      basicWeek: 'default',
      basicDay: 'default',
      agendaWeek: 'special!!!',
      agendaDay: 'special!!!'
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
      month: 'default',
      basicWeek: 'special!!!',
      basicDay: 'default',
      agendaWeek: 'special!!!',
      agendaDay: 'default'
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
      month: 'default',
      basicWeek: 'default',
      basicDay: 'special!!!',
      agendaWeek: 'default',
      agendaDay: 'special!!!'
    })
  })

  it('can implicitly target a View subclass', function() {

    class SuperBasicView extends FullCalendar.BasicView {
    }

    FullCalendar.views.superBasic = SuperBasicView

    initCalendar({
      views: {
        basic: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })

    testEachView({
      superBasic: 'special!!!',
      month: 'special!!!',
      basicDay: 'special!!!'
    })

    delete FullCalendar.views.superBasic
  })

  it('can implicitly target an old-school View subclass', function() {

    let BasicView = FullCalendar.BasicView
    function SuperBasicView() { BasicView.apply(this, arguments) }
    SuperBasicView.prototype = Object.create(BasicView.prototype)

    FullCalendar.views.superBasic = SuperBasicView

    initCalendar({
      views: {
        basic: {
          titleFormat: function() { return 'special!!!' }
        }
      }
    })

    testEachView({
      superBasic: 'special!!!',
      month: 'special!!!',
      basicDay: 'special!!!'
    })

    delete FullCalendar.views.superBasic
  })

})
