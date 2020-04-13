import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('allDaySlots', function() {

  describe('when allDaySlots is not set', function() {
    describe('in week', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          initialView: 'timeGridWeek'
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          initialView: 'timeGridDay'
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
  })

  describe('when allDaySlots is set true', function() {
    describe('in week', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          initialView: 'timeGridWeek',
          allDaySlot: true
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          initialView: 'timeGridDay',
          allDaySlot: true
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
  })

  describe('when allDaySlots is set false', function() {
    describe('in week', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          initialView: 'timeGridWeek',
          allDaySlot: false
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeFalsy()
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          initialView: 'timeGridDay',
          allDaySlot: false
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeFalsy()
      })
    })
  })
})
