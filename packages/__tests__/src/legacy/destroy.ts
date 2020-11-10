import { ListenerCounter } from '../lib/ListenerCounter'
import { primeVDomContainer } from '../lib/vdom-misc'

describe('destroy', () => {
  describe('when calendar is LTR', () => {
    it('cleans up all classNames on the root element', () => {
      initCalendar({
        direction: 'ltr',
      })
      currentCalendar.destroy()
      expect(currentCalendar.el.className).toBe('')
    })
  })

  describe('when calendar is RTL', () => {
    it('cleans up all classNames on the root element', () => {
      initCalendar({
        direction: 'rtl',
      })
      currentCalendar.destroy()
      expect(currentCalendar.el.className).toBe('')
    })
  })

  describeOptions('themeSystem', {
    'when bootstrap theme': 'bootstrap',
  }, () => {
    it('cleans up all classNames on the root element', () => {
      initCalendar()
      currentCalendar.destroy()
      expect(currentCalendar.el.className).toBe('')
    })
  })

  pushOptions({
    initialDate: '2014-12-01',
    droppable: true, // likely to attach document handler
    editable: true, // same
    events: [
      { title: 'event1', start: '2014-12-01' },
    ],
  })

  describeOptions('initialView', {
    'when in dayGridWeek view': 'dayGridWeek',
    'when in week view': 'timeGridWeek',
    'when in listWeek view': 'listWeek',
    'when in month view': 'dayGridMonth',
  }, (viewName) => {
    it('leaves no handlers attached to DOM', () => {
      let $el = $('<div>').appendTo('body')
      primeVDomContainer($el[0])

      let elHandlerCounter = new ListenerCounter($el[0])
      let docHandlerCounter = new ListenerCounter(document)

      elHandlerCounter.startWatching()
      docHandlerCounter.startWatching()

      initCalendar({}, $el)
      currentCalendar.destroy()

      if (viewName !== 'timeGridDay') { // hack for skipping 3rd one
        expect(elHandlerCounter.stopWatching()).toBe(0)
        expect(docHandlerCounter.stopWatching()).toBe(0)
      }

      $el.remove()
    })

    // Issue 2432
    it('preserves existing window handlers when handleWindowResize is off', () => {
      let resizeHandler = () => {}
      let windowListenerCounter = new ListenerCounter(window)
      windowListenerCounter.startWatching()

      window.addEventListener('resize', resizeHandler)
      expect(windowListenerCounter.computeDelta()).toBe(1)

      initCalendar({
        handleWindowResize: false,
      })
      currentCalendar.destroy()

      expect(windowListenerCounter.stopWatching()).toBe(1)
      window.removeEventListener('resize', resizeHandler)
    })
  })
})
