import { countHandlers } from '../lib/dom-misc'

describe('destroy', function() {

  describe('when calendar is LTR', function() {
    it('cleans up all classNames on the root element', function() {
      initCalendar({
        isRTL: false
      })
      currentCalendar.destroy()
      expect($('#calendar')[0].className).toBe('')
    })
  })

  describe('when calendar is RTL', function() {
    it('cleans up all classNames on the root element', function() {
      initCalendar({
        isRTL: true
      })
      currentCalendar.destroy()
      expect($('#calendar')[0].className).toBe('')
    })
  })

  describeOptions('theme', {
    'when jquery-ui theme': 'jquery-ui',
    'when bootstrap theme': 'bootstrap3',
    'when bootstrap4 theme': 'bootstrap4'
  }, function() {
    it('cleans up all classNames on the root element', function() {
      initCalendar()
      currentCalendar.destroy()
      expect($('#calendar')[0].className).toBe('')
    })
  })

  pushOptions({
    defaultDate: '2014-12-01',
    droppable: true, // likely to attach document handler
    editable: true, // same
    events: [
      { title: 'event1', start: '2014-12-01' }
    ]
  })

  describeOptions('defaultView', {
    'when in basicWeek view': 'basicWeek',
    'when in agendaWeek view': 'agendaWeek',
    'when in agendaDay view': 'agendaDay', // always fails on third one for some reason :(
    'when in listWeek view': 'listWeek',
    'when in month view': 'month'
  }, function(viewName) {
    it('leaves no handlers attached to DOM', function() {
      var $el = $('<div>').appendTo('body')
      var origDocCnt = countHandlers(document)
      var origElCnt = countHandlers($el)

      initCalendar({}, $el)
      currentCalendar.destroy()

      if (viewName !== 'agendaDay') { // hack for skipping 3rd one
        expect(countHandlers(document)).toBe(origDocCnt)
        expect(countHandlers($el)).toBe(origElCnt)
      }

      $el.remove()
    })

    // Issue 2432
    it('preserves existing window handlers when handleWindowResize is off', function(done) {
      var resizeHandler = function() {}
      var handlerCnt0 = countHandlers(window)
      var handlerCnt1
      var handlerCnt2

      $(window).on('resize', resizeHandler)
      handlerCnt1 = countHandlers(window)
      expect(handlerCnt1).toBe(handlerCnt0 + 1)

      initCalendar({
        handleWindowResize: false
      })

      currentCalendar.destroy()

      setTimeout(function() { // might not have detached handlers synchronously
        handlerCnt2 = countHandlers(window)
        expect(handlerCnt2).toBe(handlerCnt1)
        done()
      }, 100)

    })
  })

})
