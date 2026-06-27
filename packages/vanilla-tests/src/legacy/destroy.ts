import { ListenerCounter } from '../lib/ListenerCounter'
import { prepareStandardListeners } from '../lib/vdom-misc'

describe('destroy', () => {
  describe('when calendar is LTR', () => {
    it('cleans up all classNames on the root element', () => {
      let calendar = initCalendar({
        direction: 'ltr',
      })
      calendar.destroy()
      expect(calendar.el.className).toBe('')
    })
  })

  describe('when calendar is RTL', () => {
    it('cleans up all classNames on the root element', () => {
      let calendar = initCalendar({
        direction: 'rtl',
      })
      calendar.destroy()
      expect(calendar.el.className).toBe('')
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
  }, () => {
    it('leaves no handlers attached to DOM', () => {
      const standardElListenerCount = prepareStandardListeners()
      let $el = $('<div>').appendTo('body')

      let elHandlerCounter = new ListenerCounter($el[0])
      let docHandlerCounter = new ListenerCounter(document)

      elHandlerCounter.startWatching()
      docHandlerCounter.startWatching()

      let calendar = initCalendar({}, $el[0])
      calendar.destroy()

      expect(elHandlerCounter.stopWatching()).toBe(standardElListenerCount)
      expect(docHandlerCounter.stopWatching()).toBe(0)

      $el.remove()
    })
  })
})
