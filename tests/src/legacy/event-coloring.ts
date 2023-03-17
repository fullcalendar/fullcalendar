import { EventInput } from '@fullcalendar/core'
import { RED_REGEX } from '../lib/dom-misc.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('event coloring', () => {
  pushOptions({
    initialDate: '2014-11-04',
    allDaySlot: false,
  })

  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    })

    defineViewTests(false)
  })

  describe('when in week view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    })

    defineViewTests(true)
  })

  function defineViewTests(eventHasTime) {
    describe('for foreground events', () => {
      testTextColor(eventHasTime)
      testBorderColor(eventHasTime)
      testBackgroundColor(eventHasTime)
    })

    describe('for background events', () => {
      testBackgroundColor(eventHasTime, 'background')
    })
  }

  function testTextColor(eventHasTime) {
    let eventOptions = getEventOptions(eventHasTime)

    it('should accept the global eventTextColor', () => {
      initCalendar({
        eventTextColor: 'red',
        events: [getTestEvent(eventOptions)],
      })
      expect(getEventCss('color')).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s textColor', () => {
      initCalendar({
        eventTextColor: 'blue', // even when there's a more general setting
        eventSources: [{
          textColor: 'red',
          events: [getTestEvent(eventOptions)],
        }],
      })
      expect(getEventCss('color')).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s textColor', () => {
      let eventInput = getTestEvent(eventOptions, {
        textColor: 'red',
      })
      initCalendar({
        eventTextColor: 'blue', // even when there's a more general setting
        events: [eventInput],
      })
      expect(getEventCss('color')).toMatch(RED_REGEX)
    })
  }

  function testBorderColor(eventHasTime) {
    let eventOptions = getEventOptions(eventHasTime)

    it('should accept the global eventColor for border color', () => {
      initCalendar({
        eventColor: 'red',
        events: [getTestEvent(eventOptions)],
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept the global eventBorderColor', () => {
      initCalendar({
        eventColor: 'blue',
        eventBorderColor: 'red',
        events: [getTestEvent(eventOptions)],
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s color for the border', () => {
      initCalendar({
        eventBorderColor: 'blue', // even when there's a more general setting
        eventSources: [{
          color: 'red',
          events: [getTestEvent(eventOptions)],
        }],
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s borderColor', () => {
      initCalendar({
        eventBorderColor: 'blue', // even when there's a more general setting
        eventSources: [{
          color: 'blue',
          borderColor: 'red',
          events: [getTestEvent(eventOptions)],
        }],
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s color for the border', () => {
      let eventInput = getTestEvent(eventOptions, {
        color: 'red',
      })
      initCalendar({
        eventSources: [{
          borderColor: 'blue', // even when there's a more general setting
          events: [eventInput],
        }],
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s borderColor', () => {
      let eventInput = getTestEvent(eventOptions, {
        color: 'blue', // even when there's a more general setting
        borderColor: 'red',
      })
      initCalendar({
        eventSources: [{
          events: [eventInput],
        }],
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })
  }

  function testBackgroundColor(eventHasTime, display?) {
    let eventOptions = getEventOptions(eventHasTime)

    if (typeof display !== 'undefined') {
      eventOptions.display = display
    }

    it('should accept the global eventColor for background color', () => {
      initCalendar({
        eventColor: 'red',
        events: [getTestEvent(eventOptions)],
      })
      expect(getEventCss('background-color', display)).toMatch(RED_REGEX)
    })

    it('should accept the global eventBackgroundColor', () => {
      initCalendar({
        eventColor: 'blue', // even when there's a more general setting
        eventBackgroundColor: 'red',
        events: [getTestEvent(eventOptions)],
      })
      expect(getEventCss('background-color', display)).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s color for the background', () => {
      initCalendar({
        eventBackgroundColor: 'blue', // even when there's a more general setting
        eventSources: [{
          color: 'red',
          events: [getTestEvent(eventOptions)],
        }],
      })
      expect(getEventCss('background-color', display)).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s backgroundColor', () => {
      initCalendar({
        eventSources: [{
          color: 'blue', // even when there's a more general setting
          backgroundColor: 'red',
          events: [getTestEvent(eventOptions)],
        }],
      })
      expect(getEventCss('background-color', display)).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s color for the background', () => {
      let eventInput = getTestEvent(eventOptions)
      eventInput.color = 'red'
      initCalendar({
        eventSources: [{
          backgroundColor: 'blue', // even when there's a more general setting
          events: [eventInput],
        }],
      })
      expect(getEventCss('background-color', display)).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s backgroundColor', () => {
      let eventInput = getTestEvent(eventOptions)
      eventInput.color = 'blue' // even when there's a more general setting
      eventInput.backgroundColor = 'red'
      initCalendar({
        eventSources: [{
          events: [eventInput],
        }],
      })
      expect(getEventCss('background-color', display)).toMatch(RED_REGEX)
    })
  }

  function getEventCss(prop, display?) {
    let calendarWrapper = new CalendarWrapper(currentCalendar)
    let eventEl = display === 'background'
      ? calendarWrapper.getBgEventEls()[0]
      : calendarWrapper.getEventEls()[0]

    if (prop === 'color') {
      return $(eventEl).find('.fc-event-title').css(prop)
    }

    return $(eventEl).css(prop)
  }

  function getTestEvent(defaultOptions, extraOptions = {}): EventInput {
    let event = {} as EventInput
    $.extend(event, defaultOptions)
    if (extraOptions) {
      $.extend(event, extraOptions)
    }
    return event
  }

  function getEventOptions(eventHasTime): EventInput {
    let options = {
      start: '2014-11-04',
    }
    if (eventHasTime) {
      options.start += 'T01:00:00'
    }
    return options
  }
})
