
describe('RenderQueue', function() {
  var RenderQueue = $.fullCalendar.RenderQueue

  it('executes atomic events in sequence', function() {
    var ops = []
    var q = new RenderQueue()

    q.queue(function() {
      ops.push('fooinit')
    }, 'foo', 'init')

    q.queue(function() {
      ops.push('fooremove')
    }, 'foo', 'add')

    q.queue(function() {
      ops.push('fooadd')
    }, 'foo', 'remove')

    q.queue(function() {
      ops.push('foodestroy')
    }, 'foo', 'destroy')

    expect(ops).toEqual([ 'fooinit', 'fooremove', 'fooadd', 'foodestroy' ])
  })

  describe('when accumulating', function() {

    describe('using clear action', function() {

      it('destroys add/remove operations in same namespace', function() {
        var ops = []
        var q = new RenderQueue()
        q.pause()

        q.queue(function() {
          ops.push('fooadd')
        }, 'foo', 'add')

        q.queue(function() {
          ops.push('fooremove')
        }, 'foo', 'remove')

        q.queue(function() {
          ops.push('foodestroy')
        }, 'foo', 'destroy')

        expect(ops).toEqual([])
        q.resume()
        expect(ops).toEqual([ 'foodestroy' ])
      })
    })
  })

  describe('when namespace has a wait value', function() {

    it('unpauses when done', function(done) {
      var ops = []
      var q = new RenderQueue({
        foo: 100
      })

      q.queue(function() {
        ops.push('fooinit')
      }, 'foo', 'init')

      q.queue(function() {
        ops.push('fooadd')
      }, 'foo', 'add')

      expect(ops).toEqual([])

      setTimeout(function() {
        expect(ops).toEqual([ 'fooinit', 'fooadd' ])
        done()
      }, 200)
    })

    it('restarts timer when new operation happens', function(done) {
      var ops = []
      var q = new RenderQueue({
        foo: 100
      })

      q.queue(function() {
        ops.push('fooinit')
      }, 'foo', 'init')

      setTimeout(function() {
        q.queue(function() {
          ops.push('fooadd')
        }, 'foo', 'add')
      }, 50)

      setTimeout(function() {
        expect(ops).toEqual([])
      }, 125)

      setTimeout(function() {
        expect(ops).toEqual([ 'fooinit', 'fooadd' ])
        done()
      }, 175)
    })

    it('synchronously executes queue when sync non-namespace operation happens', function() {
      var ops = []
      var q = new RenderQueue({
        foo: 100
      })

      q.queue(function() {
        ops.push('fooinit')
      }, 'foo', 'init')

      q.queue(function() {
        ops.push('fooadd')
      }, 'foo', 'add')

      expect(ops).toEqual([])

      q.queue(function() {
        ops.push('barinit')
      }, 'bar', 'init')

      expect(ops).toEqual([ 'fooinit', 'fooadd', 'barinit' ])
    })

    it('synchronously executes queue when async non-namespace operation happens', function(done) {
      var ops = []
      var q = new RenderQueue({
        foo: 100,
        bar: 100
      })

      q.queue(function() {
        ops.push('fooinit')
      }, 'foo', 'init')

      q.queue(function() {
        ops.push('fooadd')
      }, 'foo', 'add')

      expect(ops).toEqual([])

      q.queue(function() {
        ops.push('barinit')
      }, 'bar', 'init')

      expect(ops).toEqual([ 'fooinit', 'fooadd' ])

      setTimeout(function() {
        expect(ops).toEqual([ 'fooinit', 'fooadd', 'barinit' ])
        done()
      }, 200)
    })

    it('resumes non-waiting tasks when unpaused', function(done) {
      var ops = []
      var q = new RenderQueue({
        foo: 100
      })

      q.pause()

      q.queue(function() {
        ops.push('barinit')
      }, 'bar', 'init')

      q.queue(function() {
        ops.push('fooinit')
      }, 'foo', 'init')

      q.resume()
      expect(ops).toEqual([ 'barinit' ])

      setTimeout(function() {
        expect(ops).toEqual([ 'barinit', 'fooinit' ])
        done()
      }, 200)
    })

    it('paused+queued tasks from a previous namespace wait resume immediately', function(done) {
      var ops = []
      var q = new RenderQueue({
        foo: 100
      })

      q.pause()

      q.queue(function() {
        ops.push('foodestroy')
      }, 'foo', 'destroy')

      q.queue(function() {
        ops.push('bardestroy')
      }, 'bar', 'destroy')

      expect(ops).toEqual([])

      q.queue(function() {
        ops.push('barinit')
      }, 'bar', 'init')

      q.queue(function() {
        ops.push('fooinit')
      }, 'foo', 'init')

      expect(ops).toEqual([])

      q.resume()
      expect(ops).toEqual([ 'foodestroy', 'bardestroy', 'barinit' ])

      setTimeout(function() {
        expect(ops).toEqual([ 'foodestroy', 'bardestroy', 'barinit', 'fooinit' ])
        done()
      }, 200)
    })
  })
})
