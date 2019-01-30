import { getDayGridSlotElsCount } from './../lib/TimeGridViewUtils'

describe('allDaySlots', function() {

  describe('when allDaySlots is not set', function() {
    describe('in week', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'week'
        }
        initCalendar(options)
        var allDaySlotCount = getDayGridSlotElsCount()
        expect(allDaySlotCount).toEqual(1)
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'day'
        }
        initCalendar(options)
        var allDaySlotCount = getDayGridSlotElsCount()
        expect(allDaySlotCount).toEqual(1)
      })
    })
  })

  describe('when allDaySlots is set true', function() {
    describe('in week', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'week',
          allDaySlot: true
        }
        initCalendar(options)
        var allDaySlotCount = getDayGridSlotElsCount()
        expect(allDaySlotCount).toEqual(1)
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'day',
          allDaySlot: true
        }
        initCalendar(options)
        var allDaySlotCount = getDayGridSlotElsCount()
        expect(allDaySlotCount).toEqual(1)
      })
    })
  })

  describe('when allDaySlots is set false', function() {
    describe('in week', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'week',
          allDaySlot: false
        }
        initCalendar(options)
        var allDaySlotCount = getDayGridSlotElsCount()
        expect(allDaySlotCount).toEqual(0)
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'day',
          allDaySlot: false
        }
        initCalendar(options)
        var allDaySlotCount = getDayGridSlotElsCount()
        expect(allDaySlotCount).toEqual(0)
      })
    })
  })
})
