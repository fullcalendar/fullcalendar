import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('selectMirror', () => {
  pushOptions({
    initialDate: '2014-08-03',
    initialView: 'timeGridWeek',
    scrollTime: '00:00:00',
    selectMirror: true,
  })

  it('goes through eventDidMount', () => {
    let options = {
      eventDidMount(arg) {
        expect(arg.isMirror).toBe(true)
      },
    }

    spyOn(options, 'eventDidMount').and.callThrough()

    let calendar = initCalendar(options)

    calendar.select('2014-08-04T01:00:00Z', '2014-08-04T04:00:00Z')

    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let mirrorEls = timeGridWrapper.getMirrorEls()

    expect(mirrorEls.length).toBe(1)
    expect(options.eventDidMount).toHaveBeenCalled()
  })
})
