import { selectTimeGrid } from '../lib/time-grid'

describe('selectAllow', function() {

  pushOptions({
    now: '2016-09-04',
    defaultView: 'agendaWeek',
    scrollTime: '00:00',
    selectable: true
  })

  it('disallows selecting when returning false', function(done) { // and given correct params
    var options = {
      selectAllow: function(selectInfo) {
        expect(typeof selectInfo).toBe('object')
        expect(moment.isMoment(selectInfo.start)).toBe(true)
        expect(moment.isMoment(selectInfo.end)).toBe(true)
        return false
      }
    }
    spyOn(options, 'selectAllow').and.callThrough()

    initCalendar(options)

    selectTimeGrid('2016-09-04T01:00:00', '2016-09-04T05:00:00')
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

    selectTimeGrid('2016-09-04T01:00:00', '2016-09-04T05:00:00')
      .then(function(selectInfo) {
        expect(typeof selectInfo).toBe('object')
        expect(selectInfo.start.format()).toBe('2016-09-04T01:00:00')
        expect(selectInfo.end.format()).toBe('2016-09-04T05:30:00')
        expect(options.selectAllow).toHaveBeenCalled()
        done()
      })
  })
})
