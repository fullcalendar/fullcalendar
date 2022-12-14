import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { waitDateSelect } from '../lib/wrappers/interaction-util.js'

describe('selectAllow', () => {
  pushOptions({
    now: '2016-09-04',
    initialView: 'timeGridWeek',
    scrollTime: '00:00',
    selectable: true,
  })

  it('disallows selecting when returning false', (done) => { // and given correct params
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
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let selecting = timeGridWrapper.selectDates('2016-09-04T01:00:00Z', '2016-09-04T05:00:00Z')

    waitDateSelect(calendar, selecting).then((selectInfo) => {
      expect(selectInfo).toBeFalsy()
      expect(options.selectAllow).toHaveBeenCalled()
      done()
    })
  })

  it('allows selecting when returning true', (done) => {
    let options = {
      selectAllow(selectInfo) {
        return true
      },
    }
    spyOn(options, 'selectAllow').and.callThrough()

    let calendar = initCalendar(options)
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let selecting = timeGridWrapper.selectDates('2016-09-04T01:00:00Z', '2016-09-04T05:00:00Z')

    waitDateSelect(calendar, selecting).then((selectInfo) => {
      expect(typeof selectInfo).toBe('object')
      expect(selectInfo.start).toEqualDate('2016-09-04T01:00:00Z')
      expect(selectInfo.end).toEqualDate('2016-09-04T05:00:00Z')
      expect(options.selectAllow).toHaveBeenCalled()
      done()
    })
  })
})
