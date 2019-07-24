
describe('implicit unselection', function() {
  pushOptions({
    defaultView: 'dayGridMonth',
    fixedWeekCount: true,
    now: '2018-09-11'
  })

  it('happens when dates change', function() {
    let selectFired = 0
    let unselectFired = 0

    initCalendar({
      select() {
        selectFired++
      },
      unselect() {
        unselectFired++
      }
    })

    currentCalendar.select('2018-09-24', '2018-10-03') // will still be visible after .next()
    expect(selectFired).toBe(1)
    expect(unselectFired).toBe(0)

    currentCalendar.next()
    expect(selectFired).toBe(1)
    expect(unselectFired).toBe(1) // unselected
  })

  it('happens when view changes', function() {
    let selectFired = 0
    let unselectFired = 0

    initCalendar({
      select() {
        selectFired++
      },
      unselect() {
        unselectFired++
      }
    })

    currentCalendar.select('2018-09-09', '2018-09-14') // will still be visible after view switch
    expect(selectFired).toBe(1)
    expect(unselectFired).toBe(0)

    currentCalendar.changeView('dayGridWeek')
    expect(selectFired).toBe(1)
    expect(unselectFired).toBe(1) // unselected
  })

})
