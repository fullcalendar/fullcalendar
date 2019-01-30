import ListenerCounter from '../lib/ListenerCounter'

describe('destroy', function() {

  describe('when calendar is LTR', function() {
    it('cleans up all classNames on the root element', function() {
      initCalendar({
        dir: 'ltr'
      })
      currentCalendar.destroy()
      expect($('#calendar')[0].className).toBe('')
    })
  })

  describe('when calendar is RTL', function() {
    it('cleans up all classNames on the root element', function() {
      initCalendar({
        dir: 'rtl'
      })
      currentCalendar.destroy()
      expect($('#calendar')[0].className).toBe('')
    })
  })

  describeOptions('themeSystem', {
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
    'when in dayGridWeek view': 'dayGridWeek',
    'when in week view': 'week',
    'when in listWeek view': 'listWeek',
    'when in month view': 'month'
  }, function(viewName) {
    it('leaves no handlers attached to DOM', function() {
      var $el = $('<div>').appendTo('body')
      var elHandlerCounter = new ListenerCounter($el[0])
      var docHandlerCounter = new ListenerCounter(document)

      elHandlerCounter.startWatching()
      docHandlerCounter.startWatching()

      initCalendar({}, $el)
      currentCalendar.destroy()

      if (viewName !== 'day') { // hack for skipping 3rd one
        expect(elHandlerCounter.stopWatching()).toBe(0)
        expect(docHandlerCounter.stopWatching()).toBe(0)
      }

      $el.remove()
    })

    // Issue 2432
    it('preserves existing window handlers when handleWindowResize is off', function() {
      var resizeHandler = function() {}
      var windowListenerCounter = new ListenerCounter(window)
      windowListenerCounter.startWatching()

      window.addEventListener('resize', resizeHandler)
      expect(windowListenerCounter.computeDelta()).toBe(1)

      initCalendar({
        handleWindowResize: false
      })
      currentCalendar.destroy()

      expect(windowListenerCounter.stopWatching()).toBe(1)
      window.removeEventListener('resize', resizeHandler)
    })
  })

})
