
describe('setting option dynamically', function() {

  it('does not cause refetch of events', function(done) {
    var fetchCnt = 0

    initCalendar({
      defaultView: 'dayGridMonth',
      events: function(arg, callback) {
        fetchCnt++
        callback([])
      }
    })

    expect(fetchCnt).toBe(1)

    currentCalendar.setOption('selectable', true)

    setTimeout(function() { // in case async
      expect(fetchCnt).toBe(1)
      done()
    }, 0)
  })
})
