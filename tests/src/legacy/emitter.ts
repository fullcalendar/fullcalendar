import { Emitter } from '@fullcalendar/core/internal'

describe('emitter', () => {
  it('calls a handler', () => {
    let o = new Emitter()
    let handlers = {
      something(arg1, arg2) {
        expect(arg1).toBe(7)
        expect(arg2).toBe(8)
      },
    }
    spyOn(handlers, 'something').and.callThrough()

    o.on('something', handlers.something)
    o.trigger('something', 7, 8)
    expect(handlers.something).toHaveBeenCalled()
  })

  it('unbinds with an exact reference', () => {
    let o = new Emitter()
    let handlers = {
      something() {},
    }
    spyOn(handlers, 'something')

    o.on('something', handlers.something)
    o.trigger('something')
    expect(handlers.something).toHaveBeenCalled()

    o.off('something', handlers.something)
    o.trigger('something')
    expect(handlers.something.calls.count()).toBe(1)
  })

  it('unbinds all when no reference', () => {
    let o = new Emitter()
    let handlers = {
      something1() {},
      something2() {},
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
