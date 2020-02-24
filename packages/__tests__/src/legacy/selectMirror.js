import TimeGridViewWrapper from "../lib/wrappers/TimeGridViewWrapper"

describe('selectMirror', function() {

  pushOptions({
    defaultDate: '2014-08-03',
    defaultView: 'timeGridWeek',
    scrollTime: '00:00:00',
    selectMirror: true
  })

  it('goes through eventRender and eventPositioned', function() {
    let calendar = initCalendar({
      eventRender(arg) {
        expect(arg.isMirror).toBe(true)
        $(arg.el).addClass('eventDidRender')
      },
      eventPositioned(arg) {
        expect(arg.isMirror).toBe(true)
        $(arg.el).addClass('eventDidPosition')
      }
    })

    calendar.select('2014-08-04T01:00:00Z', '2014-08-04T04:00:00Z')

    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let mirrorEls = timeGridWrapper.getMirrorEls()
    expect(mirrorEls.length).toBe(1)
    expect(mirrorEls[0]).toHaveClass('eventDidRender')
    expect(mirrorEls[0]).toHaveClass('eventDidPosition')
  })
})
