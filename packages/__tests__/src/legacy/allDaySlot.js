import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('allDaySlots', function() {

  describe('when allDaySlots is not set', function() {
    describe('in week', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          defaultView: 'timeGridWeek'
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          defaultView: 'timeGridDay'
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
          defaultView: 'timeGridWeek',
          allDaySlot: true
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          defaultView: 'timeGridDay',
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
          defaultView: 'timeGridWeek',
          allDaySlot: false
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeFalsy()
      })
    })
    describe('in day', function() {
      it('should default to having an allDaySlots table', function() {
        var calendar = initCalendar({
          defaultView: 'timeGridDay',
          allDaySlot: false
        })
        var dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeFalsy()
      })
    })
  })
})
