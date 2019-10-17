describe('maxTime', function() {

  var numToStringConverter = function(timeIn) {
    var time = (timeIn % 12) || 12
    var amPm = 'am'
    if ((timeIn % 24) > 11) {
      amPm = 'pm'
    }
    return time + amPm
  }

  describe('when using the default settings', function() {

    describe('in week', function() {
      it('should start at 12am', function() {
        initCalendar({
          defaultView: 'timeGridWeek'
        })
        var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text()
        expect(lastSlotText).toEqual('11pm')
      })
    })

    describe('in day', function() {
      it('should start at 12am', function() {
        initCalendar({
          defaultView: 'timeGridDay'
        })
        var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text()
        expect(lastSlotText).toEqual('11pm')
      })
    })
  })

  describe('when using a whole number', function() {

    var hourNumbers = [ 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24 ]

    describe('in week', function() {
      hourNumbers.forEach(function(hourNumber) {
        it('should end at ' + hourNumber, function() {
          initCalendar({
            defaultView: 'timeGridWeek',
            maxTime: { hours: hourNumber }
          })
          var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text()
          var expected = numToStringConverter(hourNumber - 1)
          expect(lastSlotText).toEqual(expected)
        })
      })
    })

    describe('in day', function() {
      hourNumbers.forEach(function(hourNumber) {
        it('should end at ' + hourNumber, function() {
          initCalendar({
            defaultView: 'timeGridDay',
            maxTime: hourNumber + ':00' // in addition, test string duration input
          })
          var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text()
          var expected = numToStringConverter(hourNumber - 1)
          expect(lastSlotText).toEqual(expected)
        })
      })
    })
  })

  describe('when using default slotInterval and \'uneven\' maxTime', function() {

    var hourNumbers = [ 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24 ]

    describe('in week', function() {
      hourNumbers.forEach(function(hourNumber) {
        it('should end at ' + hourNumber + ':20', function() {
          initCalendar({
            defaultView: 'timeGridWeek',
            maxTime: { hours: hourNumber, minutes: 20 }
          })
          var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text()
          // since exclusive end is :20, last slot will be on the current hour's 00:00
          var expected = numToStringConverter(hourNumber)
          expect(lastSlotText).toEqual(expected)
        })
      })
    })

    describe('in day', function() {
      hourNumbers.forEach(function(hourNumber) {
        it('should end at ' + hourNumber + ':20', function() {
          initCalendar({
            defaultView: 'timeGridDay',
            maxTime: { hours: hourNumber, minutes: 20 }
          })
          var lastSlotText = $('.fc-slats tr:not(.fc-minor):last .fc-time').text()
          // since exclusive end is :20, last slot will be on the current hour's 00:00
          var expected = numToStringConverter(hourNumber)
          expect(lastSlotText).toEqual(expected)
        })
      })
    })
  })
})
