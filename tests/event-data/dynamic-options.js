
describe('setting option dynamically', function() {

  it('does not cause refetch of events', function(done) {
    var fetchCnt = 0

    initCalendar({
      defaultView: 'month',
      events: function(start, end, timezone, callback) {
        fetchCnt++
        callback([])
      }
    })

    expect(fetchCnt).toBe(1)

    currentCalendar.option('selectable', true)

    setTimeout(function() { // in case async
      expect(fetchCnt).toBe(1)
      done()
    }, 0)
  })
})
