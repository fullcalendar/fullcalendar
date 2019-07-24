import { getDayGridSlotElsCount } from './../lib/TimeGridViewUtils'

describe('allDaySlots', function() {

  describe('when allDaySlots is not set', function() {
    describe('in week', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'timeGridWeek'
        }
        initCalendar(options)
        var allDaySlotCount = getDayGridSlotElsCount()
        expect(allDaySlotCount).toEqual(1)
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'timeGridDay'
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
          defaultView: 'timeGridWeek',
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
          defaultView: 'timeGridDay',
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
          defaultView: 'timeGridWeek',
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
          defaultView: 'timeGridDay',
          allDaySlot: false
        }
        initCalendar(options)
        var allDaySlotCount = getDayGridSlotElsCount()
        expect(allDaySlotCount).toEqual(0)
      })
    })
  })
})
