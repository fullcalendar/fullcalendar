describe('view-specific options', function() {
  var options

  beforeEach(function() {
    options = {
      header: {
        left: 'prev,next',
        center: 'title',
        right: 'month,basicWeek,basicDay,agendaWeek,agendaDay'
      },
      defaultView: 'month',
      titleFormat: '[default]',
      views: { }
    }
    affix('#cal')
  })

  function testEachView(viewsAndVals) {
    $('#cal').fullCalendar(options)
    $.each(viewsAndVals, function(view, val) {
      $('#cal').fullCalendar('changeView', view)
      expect($('h2')).toHaveText(val)
    })
  }

  it('can target a specific view (month)', function() {
    options.views.month = {
      titleFormat: '[special!!!]'
    }
    testEachView({
      month: 'special!!!',
      basicWeek: 'default',
      basicDay: 'default',
      agendaWeek: 'default',
      agendaDay: 'default'
    })
  })

  it('can target a specific view (agendaWeek)', function() {
    options.views.agendaWeek = {
      titleFormat: '[special!!!]'
    }
    testEachView({
      month: 'default',
      basicWeek: 'default',
      basicDay: 'default',
      agendaWeek: 'special!!!',
      agendaDay: 'default'
    })
  })

  it('can target basic views', function() {
    options.views.basic = {
      titleFormat: '[special!!!]'
    }
    testEachView({
      month: 'default', // will NOT target month view
      basicWeek: 'special!!!',
      basicDay: 'special!!!',
      agendaWeek: 'default',
      agendaDay: 'default'
    })
  })

  it('can target agenda views', function() {
    options.views.agenda = {
      titleFormat: '[special!!!]'
    }
    testEachView({
      month: 'default',
      basicWeek: 'default',
      basicDay: 'default',
      agendaWeek: 'special!!!',
      agendaDay: 'special!!!'
    })
  })

  it('can target week views', function() {
    options.views.week = {
      titleFormat: '[special!!!]'
    }
    testEachView({
      month: 'default',
      basicWeek: 'special!!!',
      basicDay: 'default',
      agendaWeek: 'special!!!',
      agendaDay: 'default'
    })
  })

  it('can target day views', function() {
    options.views.day = {
      titleFormat: '[special!!!]'
    }
    testEachView({
      month: 'default',
      basicWeek: 'default',
      basicDay: 'special!!!',
      agendaWeek: 'default',
      agendaDay: 'special!!!'
    })
  })
})
