import { RED_REGEX } from '../lib/dom-misc'

describe('event coloring', function() {

  pushOptions({
    defaultDate: '2014-11-04'
  })

  describe('when in month view', function() {

    pushOptions({
      defaultView: 'month'
    })

    defineViewTests(false)
  })

  describe('when in agendaWeek view', function() {

    pushOptions({
      defaultView: 'agendaWeek',
      allDaySlot: false
    })

    defineViewTests(true)
  })

  function defineViewTests(eventHasTime) {

    describe('for foreground events', function() {
      testTextColor(eventHasTime)
      testBorderColor(eventHasTime)
      testBackgroundColor(eventHasTime)
    })

    describe('for background events', function() {
      testBackgroundColor(eventHasTime, 'background')
    })

  }

  function testTextColor(eventHasTime) {

    var eventOptions = getEventOptions(eventHasTime)

    it('should accept the global eventTextColor', function() {
      initCalendar({
        eventTextColor: 'red',
        events: [ getTestEvent(eventOptions) ]
      })
      expect(getEventCss('color')).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s textColor', function() {
      initCalendar({
        eventTextColor: 'blue', // even when there's a more general setting
        eventSources: [ {
          textColor: 'red',
          events: [ getTestEvent(eventOptions) ]
        } ]
      })
      expect(getEventCss('color')).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s textColor', function() {
      var eventInput = getTestEvent(eventOptions, {
        textColor: 'red'
      })
      initCalendar({
        textColor: 'blue', // even when there's a more general setting
        events: [ eventInput ]
      })
      expect(getEventCss('color')).toMatch(RED_REGEX)
    })
  }

  function testBorderColor(eventHasTime) {

    var eventOptions = getEventOptions(eventHasTime)

    it('should accept the global eventColor for border color', function() {
      initCalendar({
        eventColor: 'red',
        events: [ getTestEvent(eventOptions) ]
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept the global eventBorderColor', function() {
      initCalendar({
        eventColor: 'blue',
        eventBorderColor: 'red',
        events: [ getTestEvent(eventOptions) ]
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s color for the border', function() {
      initCalendar({
        eventBorderColor: 'blue', // even when there's a more general setting
        eventSources: [ {
          color: 'red',
          events: [ getTestEvent(eventOptions) ]
        } ]
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s borderColor', function() {
      initCalendar({
        eventBorderColor: 'blue', // even when there's a more general setting
        eventSources: [ {
          color: 'blue',
          borderColor: 'red',
          events: [ getTestEvent(eventOptions) ]
        } ]
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s color for the border', function() {
      var eventInput = getTestEvent(eventOptions, {
        color: 'red'
      })
      initCalendar({
        eventSources: [ {
          borderColor: 'blue', // even when there's a more general setting
          events: [ eventInput ]
        } ]
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s borderColor', function() {
      var eventInput = getTestEvent(eventOptions, {
        color: 'blue', // even when there's a more general setting
        borderColor: 'red'
      })
      initCalendar({
        eventSources: [ {
          events: [ eventInput ]
        } ]
      })
      expect(getEventCss('border-top-color')).toMatch(RED_REGEX)
    })
  }


  function testBackgroundColor(eventHasTime, rendering) {

    var eventOptions = getEventOptions(eventHasTime)

    if (typeof rendering !== 'undefined') {
      eventOptions.rendering = rendering
    }

    it('should accept the global eventColor for background color', function() {
      initCalendar({
        eventColor: 'red',
        events: [ getTestEvent(eventOptions) ]
      })
      expect(getEventCss('background-color', rendering)).toMatch(RED_REGEX)
    })

    it('should accept the global eventBackgroundColor', function() {
      initCalendar({
        eventColor: 'blue', // even when there's a more general setting
        eventBackgroundColor: 'red',
        events: [ getTestEvent(eventOptions) ]
      })
      expect(getEventCss('background-color', rendering)).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s color for the background', function() {
      initCalendar({
        eventBackgroundColor: 'blue', // even when there's a more general setting
        eventSources: [ {
          color: 'red',
          events: [ getTestEvent(eventOptions) ]
        } ]
      })
      expect(getEventCss('background-color', rendering)).toMatch(RED_REGEX)
    })

    it('should accept an event source\'s backgroundColor', function() {
      initCalendar({
        eventSources: [ {
          color: 'blue', // even when there's a more general setting
          backgroundColor: 'red',
          events: [ getTestEvent(eventOptions) ]
        } ]
      })
      expect(getEventCss('background-color', rendering)).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s color for the background', function() {
      var eventInput = getTestEvent(eventOptions)
      eventInput.color = 'red'
      initCalendar({
        eventSources: [ {
          backgroundColor: 'blue', // even when there's a more general setting
          events: [ eventInput ]
        } ]
      })
      expect(getEventCss('background-color', rendering)).toMatch(RED_REGEX)
    })

    it('should accept an event object\'s backgroundColor', function() {
      var eventInput = getTestEvent(eventOptions)
      eventInput.color = 'blue' // even when there's a more general setting
      eventInput.backgroundColor = 'red'
      initCalendar({
        eventSources: [ {
          events: [ eventInput ]
        } ]
      })
      expect(getEventCss('background-color', rendering)).toMatch(RED_REGEX)
    })
  }

  function getEventCss(prop, rendering) {
    var el = $(rendering === 'background' ? '.fc-bgevent' : '.fc-event')
    return el.css(prop)
  }

  function getTestEvent(defaultOptions, extraOptions) {
    var event = {}
    $.extend(event, defaultOptions)
    if (extraOptions) {
      $.extend(event, extraOptions)
    }
    return event
  }

  function getEventOptions(eventHasTime) {
    var options = {
      start: '2014-11-04'
    }
    if (eventHasTime) {
      options.start += 'T01:00:00'
    }
    return options
  };

})
