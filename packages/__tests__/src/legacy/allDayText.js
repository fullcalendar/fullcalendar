import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('allDayContent', function() { // TODO: rename file

  describe('when allDaySlots is not set', function() {
    describe('in week', function() {
      it('should default allDayContent to using \'all-day\'', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridWeek'
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
    describe('in day', function() {
      it('should default allDayContent to using \'all-day\'', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridDay'
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
  })

  describe('when allDaySlots is set true', function() {
    describe('in week', function() {
      it('should default allDayContent to using \'all-day\'', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridWeek',
          allDaySlot: true
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
    describe('in day', function() {
      it('should default allDayContent to using \'all-day\'', function() {
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

  describe('when allDaySlots is set true and allDayContent is specified', function() {
    describe('in week', function() {
      it('should show specified all day text', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridWeek',
          allDaySlot: true,
          allDayContent: 'axis-phosy'
        })
        expectAllDayTextToBe(calendar, 'axis-phosy')
      })
    })
    describe('in day', function() {
      it('should show specified all day text', function() {
        let calendar = initCalendar({
          defaultView: 'timeGridDay',
          allDayContent: 'axis-phosy'
        })
        expectAllDayTextToBe(calendar, 'axis-phosy')
      })
    })
  })

  function expectAllDayTextToBe(calendar, text) {
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let allDayContent = viewWrapper.getAllDayAxisElText()
    expect(allDayContent).toBe(text)
  }

})
