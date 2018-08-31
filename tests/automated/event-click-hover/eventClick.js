import { getSingleEl } from '../event-render/EventRenderUtils'

describe('eventClick', function() {
  pushOptions({
    defaultDate: '2018-08-31',
    defaultView: 'month'
  })

  it('receives correct args', function(done) {
    initCalendar({
      events: [
        { start: '2018-08-31' }
      ],
      eventClick(arg) {
        expect(arg.el instanceof HTMLElement).toBe(true)
        expect(typeof arg.event).toBe('object')
        expect(arg.event.start instanceof Date).toBe(true)
        expect(arg.jsEvent instanceof UIEvent).toBe(true)
        expect(typeof arg.view).toBe('object')
        done()
      }
    })

    // single EVENT element
    getSingleEl().simulate('click')
  })
})
