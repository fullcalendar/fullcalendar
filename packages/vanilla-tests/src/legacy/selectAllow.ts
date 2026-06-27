import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { waitDateSelect } from '../lib/wrappers/interaction-util'
import { waitTimeout } from '../lib/misc'

describe('selectAllow', () => {
  pushOptions({
    now: '2016-09-04',
    initialView: 'timeGridWeek',
    scrollTime: '00:00',
    selectable: true,
  })

  it('disallows selecting when returning false', async () => { // and given correct params
    let options = {
      selectAllow(selectInfo) {
        expect(typeof selectInfo).toBe('object')
        expect(selectInfo.start instanceof Date).toBe(true)
        expect(selectInfo.end instanceof Date).toBe(true)
        return false
      },
    }
    spyOn(options, 'selectAllow').and.callThrough()

    let calendar = initCalendar(options)
    await waitTimeout()
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let selecting = timeGridWrapper.selectDates('2016-09-04T01:00:00Z', '2016-09-04T05:00:00Z')

    let selectInfo = await waitDateSelect(calendar, selecting)
    expect(selectInfo).toBeFalsy()
    expect(options.selectAllow).toHaveBeenCalled()
  })

  it('allows selecting when returning true', async () => {
    let options = {
      selectAllow(selectInfo) {
        return true
      },
    }
    spyOn(options, 'selectAllow').and.callThrough()

    let calendar = initCalendar(options)
    await waitTimeout()
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let selecting = timeGridWrapper.selectDates('2016-09-04T01:00:00Z', '2016-09-04T05:00:00Z')

    let selectInfo = await waitDateSelect(calendar, selecting)
    expect(typeof selectInfo).toBe('object')
    expect(selectInfo.start).toEqualDate('2016-09-04T01:00:00Z')
    expect(selectInfo.end).toEqualDate('2016-09-04T05:00:00Z')
    expect(options.selectAllow).toHaveBeenCalled()
  })
})
