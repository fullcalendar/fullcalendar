import { selectTimeGrid } from '../lib/time-grid'

describe('selectAllow', function() {

  pushOptions({
    now: '2016-09-04',
    defaultView: 'timeGridWeek',
    scrollTime: '00:00',
    selectable: true
  })

  it('disallows selecting when returning false', function(done) { // and given correct params
    var options = {
      selectAllow: function(selectInfo) {
        expect(typeof selectInfo).toBe('object')
        expect(selectInfo.start instanceof Date).toBe(true)
        expect(selectInfo.end instanceof Date).toBe(true)
        return false
      }
    }
    spyOn(options, 'selectAllow').and.callThrough()

    initCalendar(options)

    selectTimeGrid('2016-09-04T01:00:00Z', '2016-09-04T05:00:00Z')
      .then(function(selectInfo) {
        expect(selectInfo).toBeFalsy()
        expect(options.selectAllow).toHaveBeenCalled()
        done()
      })
  })

  it('allows selecting when returning true', function(done) {
    var options = {
      selectAllow: function(selectInfo) {
        return true
      }
    }
    spyOn(options, 'selectAllow').and.callThrough()

    initCalendar(options)

    selectTimeGrid('2016-09-04T01:00:00Z', '2016-09-04T05:00:00Z')
      .then(function(selectInfo) {
        expect(typeof selectInfo).toBe('object')
        expect(selectInfo.start).toEqualDate('2016-09-04T01:00:00Z')
        expect(selectInfo.end).toEqualDate('2016-09-04T05:30:00Z')
        expect(options.selectAllow).toHaveBeenCalled()
        done()
      })
  })
})
