
describe('constructor', function() {
  beforeEach(function() {
    initCalendar()
  })
  it('should return a jQuery object for chaining', function() {
    var res = $(currentCalendar.el)
    expect(res instanceof jQuery).toBe(true)
  })

  it('should not modify the options object', function() {
    var options = {
      defaultView: 'agendaWeek',
      scrollTime: '09:00:00',
      slotDuration: { minutes: 45 }
    }
    var optionsCopy = $.extend({}, options, true)
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  it('should not modify the events array', function() {
    var options = {
      defaultView: 'month',
      defaultDate: '2014-05-27',
      events: [
        {
          title: 'mytitle',
          start: '2014-05-27'
        }
      ]
    }
    var optionsCopy = $.extend(true, {}, options) // recursive copy
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  it('should not modify the eventSources array', function() {
    var options = {
      defaultView: 'month',
      defaultDate: '2014-05-27',
      eventSources: [
        { events: [
          {
            title: 'mytitle',
            start: '2014-05-27'
          }
        ] }
      ]
    }
    var optionsCopy = $.extend(true, {}, options) // recursive copy
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  describe('when called on a div', function() {
    beforeEach(function() {
      initCalendar()
    })
    it('should contain a table fc-toolbar', function() {
      var header = $(currentCalendar.el).find('.fc-toolbar')
      expect(header[0]).not.toBeUndefined()
    })

    it('should contain a div fc-view-container', function() {
      var content = $(currentCalendar.el).find('.fc-view-container')
      expect(content[0]).not.toBeUndefined()
    })

    it('should only contain 2 elements', function() {
      var calenderNodeCount = $(currentCalendar.el).find('>').length
      expect(calenderNodeCount).toEqual(2)
    })

    describe('and then called again', function() {
      it('should still only have a single set of calendar [header,content]', function() {
        initCalendar()
        var count = $(currentCalendar.el).find('>').length
        expect(count).toEqual(2)
      })
    })
  })
})
