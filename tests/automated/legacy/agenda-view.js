import { getHeaderTopEls } from './../view-render/DayGridRenderUtils'
import { DAY_CLASSES } from '../lib/constants'


const [
  SUNDAY_CLASS, MONDAY_CLASS, TUESDAY_CLASS,
  WEDNESDAY_CLASS, THURSDAY_CLASS,
  FRIDAY_CLASS, SATURDY_CLASS
] = DAY_CLASSES

const AXIS_CLASS = 'fc-axis'

describe('agenda view rendering', function() {

  describe('when isRtl is false', function() {
    pushOptions({
      defaultView: 'agendaWeek',
      isRtl: false
    })

    it('should have have days ordered sun to sat', function() {
      initCalendar()
      var headers = getHeaderTopEls()
      expect(headers[0]).toHaveClass(AXIS_CLASS)
      expect(headers[1]).toHaveClass(SUNDAY_CLASS)
      expect(headers[2]).toHaveClass(MONDAY_CLASS)
      expect(headers[3]).toHaveClass(TUESDAY_CLASS)
      expect(headers[4]).toHaveClass(WEDNESDAY_CLASS)
      expect(headers[5]).toHaveClass(THURSDAY_CLASS)
      expect(headers[6]).toHaveClass(FRIDAY_CLASS)
      expect(headers[7]).toHaveClass(SATURDY_CLASS)
    })
  })

  describe('when isRtl is true', function() {
    pushOptions({
      defaultView: 'agendaWeek',
      isRtl: true
    })

    it('should have have days ordered sat to sun', function() {
      initCalendar()
      var headers = getHeaderTopEls()
      expect(headers[0]).toHaveClass(SATURDY_CLASS)
      expect(headers[1]).toHaveClass(FRIDAY_CLASS)
      expect(headers[2]).toHaveClass(THURSDAY_CLASS)
      expect(headers[3]).toHaveClass(WEDNESDAY_CLASS)
      expect(headers[4]).toHaveClass(TUESDAY_CLASS)
      expect(headers[5]).toHaveClass(MONDAY_CLASS)
      expect(headers[6]).toHaveClass(SUNDAY_CLASS)
      expect(headers[7]).toHaveClass(AXIS_CLASS)
    })
  })

})
