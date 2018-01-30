
describe('TaskQueue', function() {
  var TaskQueue = $.fullCalendar.TaskQueue

  it('executes first task immediately', function() {
    var q = new TaskQueue()
    var ops = []

    q.on('start', function() {
      ops.push('start-event')
    })
    q.on('stop', function() {
      ops.push('stop-event')
    })

    q.queue(function() {
      ops.push('run1')
    })

    expect(ops).toEqual([ 'start-event', 'run1', 'stop-event' ])
  })

  it('executes second task after first has fully completed', function() {
    var q = new TaskQueue()
    var ops = []

    q.on('start', function() {
      ops.push('start-event')
    })
    q.on('stop', function() {
      ops.push('stop-event')
    })

    q.queue(function() {
      ops.push('start1')

      q.queue(function() {
        ops.push('run2')
      })

      ops.push('stop1')
    })

    expect(ops).toEqual([ 'start-event', 'start1', 'stop1', 'run2', 'stop-event' ])
  })

  it('executes second task after first promise resolves', function(done) {
    var q = new TaskQueue()
    var ops = []

    q.on('start', function() {
      ops.push('start-event')
    })
    q.on('stop', function() {
      ops.push('stop-event')
    })

    q.queue(function() {
      var deferred = $.Deferred()

      ops.push('start1')

      q.queue(function() {
        ops.push('run2')
      })

      setTimeout(function() {
        ops.push('stop1')
        deferred.resolve()
      }, 100)

      return deferred.promise()
    })

    setTimeout(function() {
      expect(ops).toEqual([ 'start-event', 'start1', 'stop1', 'run2', 'stop-event' ])
      done()
    }, 200)
  })

  it('serially executes two tasks, the first with a promise', function(done) {
    var q = new TaskQueue()
    var ops = []

    q.on('start', function() {
      ops.push('start-event')
    })
    q.on('stop', function() {
      ops.push('stop-event')
    })

    q.queue(function() {
      var deferred = $.Deferred()

      ops.push('start1')

      setTimeout(function() {
        ops.push('stop1')
        deferred.resolve()
      }, 100)

      return deferred.promise()
    }, function() {
      ops.push('run2')
    })

    setTimeout(function() {
      expect(ops).toEqual([ 'start-event', 'start1', 'stop1', 'run2', 'stop-event' ])
      done()
    }, 200)
  })

  describe('pausing', function() {

    it('prevents task from rendering', function() {
      var q = new TaskQueue()
      var ops = []

      q.on('start', function() {
        ops.push('start-event')
      })
      q.on('stop', function() {
        ops.push('stop-event')
      })

      q.pause()

      q.queue(function() {
        ops.push('run1')
      })
      q.queue(function() {
        ops.push('run2')
      })

      expect(ops).toEqual([ ])

      q.resume()

      expect(ops).toEqual([ 'start-event', 'run1', 'run2', 'stop-event' ])
    })
  })
})
