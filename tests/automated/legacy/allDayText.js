import { getAllDayAxisElText } from '../view-render/DayGridRenderUtils'

describe('allDayText', function() {

  describe('when allDaySlots is not set', function() {
    describe('in week', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'week'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('all-day')
      })
    })
    describe('in day', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'day'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('all-day')
      })
    })
  })

  describe('when allDaySlots is set true', function() {
    describe('in week', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'week',
          allDaySlot: true
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('all-day')
      })
    })
    describe('in day', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'day',
          allDaySlot: true
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('all-day')
      })
    })
  })

  describe('when allDaySlots is set true and locale is not default', function() {
    describe('in week', function() {
      it('should use the locale\'s all-day value', function() {
        var options = {
          defaultView: 'week',
          allDaySlot: true,
          locale: 'pt-br'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('dia inteiro')
      })
    })
    describe('in day', function() {
      it('should use the locale\'s all-day value', function() {
        var options = {
          defaultView: 'day',
          allDaySlot: true,
          locale: 'pt-br'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('dia inteiro')
      })
    })
  })

  describe('when allDaySlots is set true and allDayText is specified', function() {
    describe('in week', function() {
      it('should show specified all day text', function() {
        var options = {
          defaultView: 'week',
          allDaySlot: true,
          allDayText: 'axis-phosy'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('axis-phosy')
      })
    })
    describe('in day', function() {
      it('should show specified all day text', function() {
        var options = {
          defaultView: 'day',
          allDayText: 'axis-phosy'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('axis-phosy')
      })
    })
  })
})
