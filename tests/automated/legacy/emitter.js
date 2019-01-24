import { EmitterMixin } from '@fullcalendar/core'

describe('emitter', function() {

  it('calls a handler', function() {
    var o = new EmitterMixin()
    var handlers = {
      something: function(arg1, arg2) {
        expect(arg1).toBe(7)
        expect(arg2).toBe(8)
      }
    }
    spyOn(handlers, 'something').and.callThrough()

    o.on('something', handlers.something)
    o.trigger('something', 7, 8)
    expect(handlers.something).toHaveBeenCalled()
  })

  it('calls a handler with context and args', function() {
    var customContext
    customContext = {}
    var o = new EmitterMixin()
    var handlers = {
      something: function(arg1, arg2) {
        expect(this).toBe(customContext)
        expect(arg1).toBe(2)
        expect(arg2).toBe(3)
      }
    }
    spyOn(handlers, 'something').and.callThrough()

    o.on('something', handlers.something)
    o.triggerWith('something', customContext, [ 2, 3 ])
    expect(handlers.something).toHaveBeenCalled()
  })

  it('unbinds with an exact reference', function() {
    var o = new EmitterMixin()
    var handlers = {
      something: function() {}
    }
    spyOn(handlers, 'something')

    o.on('something', handlers.something)
    o.trigger('something')
    expect(handlers.something).toHaveBeenCalled()

    o.off('something', handlers.something)
    o.trigger('something')
    expect(handlers.something.calls.count()).toBe(1)
  })

  it('unbinds all when no reference', function() {
    var o = new EmitterMixin()
    var handlers = {
      something1: function() {},
      something2: function() {}
    }
    spyOn(handlers, 'something1')
    spyOn(handlers, 'something2')

    o.on('something', handlers.something1)
    o.on('something', handlers.something2)

    o.trigger('something')
    expect(handlers.something1).toHaveBeenCalled()
    expect(handlers.something2).toHaveBeenCalled()

    o.off('something')
    o.trigger('something')
    expect(handlers.something1.calls.count()).toBe(1)
    expect(handlers.something2.calls.count()).toBe(1)
  })

})
