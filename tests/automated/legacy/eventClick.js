
describe('eventClick', function() {

  pushOptions({
    defaultDate: '2014-08-01'
  })

  it('works in month view', function(done) {
    var options = {}
    options.events = [
      { start: '2014-08-01', title: 'event1', className: 'event1' }
    ]
    options.eventAfterAllRender = function() {
      $('.event1').simulate('click')
    }
    options.eventClick = function() {
      done()
    }
    initCalendar(options)
  })

  it('works in month view via touch', function(done) {
    var options = {}
    options.events = [
      { start: '2014-08-01', title: 'event1', className: 'event1' }
    ]
    options.eventAfterAllRender = function() {
      $.simulateTouchClick($('.event1'))
    }
    options.eventClick = function() {
      done()
    }
    initCalendar(options)
  })

})
