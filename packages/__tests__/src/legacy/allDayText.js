import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('allDayText', function() {

  describe('when allDaySlots is not set', function() {
    describe('in week', function() {
      it('should default allDayText to using \'all-day\'', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridWeek'
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
    describe('in day', function() {
      it('should default allDayText to using \'all-day\'', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridDay'
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
  })

  describe('when allDaySlots is set true', function() {
    describe('in week', function() {
      it('should default allDayText to using \'all-day\'', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridWeek',
          allDaySlot: true
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
    describe('in day', function() {
      it('should default allDayText to using \'all-day\'', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridDay',
          allDaySlot: true
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
  })

  describe('when allDaySlots is set true and locale is not default', function() {
    describe('in week', function() {
      it('should use the locale\'s all-day value', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridWeek',
          allDaySlot: true,
          locale: ptBrLocale
        })
        expectAllDayTextToBe(calendar, 'dia inteiro')
      })
    })
    describe('in day', function() {
      it('should use the locale\'s all-day value', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridDay',
          allDaySlot: true,
          locale: ptBrLocale
        })
        expectAllDayTextToBe(calendar, 'dia inteiro')
      })
    })
  })

  describe('when allDaySlots is set true and allDayText is specified', function() {
    describe('in week', function() {
      it('should show specified all day text', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridWeek',
          allDaySlot: true,
          allDayText: 'axis-phosy'
        })
        expectAllDayTextToBe(calendar, 'axis-phosy')
      })
    })
    describe('in day', function() {
      it('should show specified all day text', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridDay',
          allDayText: 'axis-phosy'
        })
        expectAllDayTextToBe(calendar, 'axis-phosy')
      })
    })
  })

  function expectAllDayTextToBe(calendar, text) {
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let allDayText = viewWrapper.getAllDayAxisElText()
    expect(allDayText).toBe(text)
  }

})
