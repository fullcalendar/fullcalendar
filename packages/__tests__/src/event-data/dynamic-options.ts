describe('setting option dynamically', () => {
  it('does not cause refetch of events', (done) => {
    let fetchCnt = 0

    initCalendar({
      initialView: 'dayGridMonth',
      events(arg, callback) {
        fetchCnt += 1
        callback([])
      },
    })

    expect(fetchCnt).toBe(1)

    currentCalendar.setOption('selectable', true)

    setTimeout(() => { // in case async
      expect(fetchCnt).toBe(1)
      done()
    }, 0)
  })
})
