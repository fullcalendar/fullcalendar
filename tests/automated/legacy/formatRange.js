describe('formatRange', function() {

  it('doesn\'t do any splitting when dates have different years', function() {
    var s = $.fullCalendar.formatRange('2014-01-01', '2015-01-01', 'MMMM Do YYYY')
    expect(s).toEqual('January 1st 2014 - January 1st 2015')
  })

  it('splits correctly on day when dates have same month', function() {
    var s = $.fullCalendar.formatRange('2014-01-01', '2014-01-05', 'MMMM Do YYYY')
    expect(s).toEqual('January 1st - 5th 2014')
  })

  it('splits correctly on day when dates have same month and smaller unit in front', function() {
    var s = $.fullCalendar.formatRange('2014-01-01', '2014-01-05', 'dddd MMMM Do YYYY')
    expect(s).toEqual('Wednesday January 1st - Sunday January 5th 2014')
  })

  it('splits correctly on the time when dates have the same day', function() {
    var s = $.fullCalendar.formatRange('2014-01-01T06:00:00', '2014-01-01T08:00:00', 'MMMM Do YYYY h:mma')
    expect(s).toEqual('January 1st 2014 6:00am - 8:00am')
  })

  it('splits correctly on the time when dates have the same day and hour but different am/pm', function() {
    var s = $.fullCalendar.formatRange('2014-01-01T06:00:00', '2014-01-01T18:00:00', 'MMMM Do YYYY h:mma')
    expect(s).toEqual('January 1st 2014 6:00am - 6:00pm')
  })

  it('splits correctly on the time when the dates have the same hour', function() {
    var s = $.fullCalendar.formatRange('2014-01-01T06:00:00', '2014-01-01T06:30:00', 'MMMM Do YYYY h:mma')
    expect(s).toEqual('January 1st 2014 6:00am - 6:30am')
  })

  it('doesn\'t split a period (German)', function() {
    var date1 = moment('2014-08-11').locale('de')
    var date2 = moment('2014-08-17').locale('de')
    var s = $.fullCalendar.formatRange(date1, date2, 'll')
    expect(s).toEqual('11. - 17. Aug. 2014')
  })

  it('doesn\'t split a period (Czech)', function() {
    var date1 = moment('2017-01-15').locale('cs')
    var date2 = moment('2017-01-21').locale('cs')
    var s = $.fullCalendar.formatRange(date1, date2, 'D. M. YYYY')
    expect(s).toEqual('15. - 21. 1. 2017')
  })

  it('uses non-standalone version of month (Russian)', function() {
    var date1 = moment('2015-01-02').locale('ru')
    var date2 = moment('2015-01-08').locale('ru')
    var s = $.fullCalendar.formatRange(date1, date2, 'DD MMMM YYYY')
    expect(s).toEqual('02 - 08 января 2015')
  })

  it('outputs the single date when the dates have the same day and time', function() {
    var s = $.fullCalendar.formatRange('2014-01-01T06:00:00', '2014-01-01T06:00:00', 'MMMM Do YYYY h:mma')
    expect(s).toEqual('January 1st 2014 6:00am')
  })

  it('outputs the single date when the dates have the same day and the format string is vague', function() {
    var s = $.fullCalendar.formatRange('2014-01-01', '2014-01-01', 'MMMM Do YYYY')
    expect(s).toEqual('January 1st 2014')
  })

  it('outputs the single week number when dates have the same week and format string is week', function() {
    var s = $.fullCalendar.formatRange('2014-01-01', '2014-01-01', 'W')
    expect(s).toEqual('1')
  })

  it('uses a custom separator', function() {
    var s = $.fullCalendar.formatRange(
      '2014-01-01T06:00:00',
      '2014-01-01T06:30:00',
      'MMMM Do YYYY h:mma',
      '<...>'
    )
    expect(s).toEqual('January 1st 2014 6:00am<...>6:30am')
  })

  describe('when called with isRTL', function() {

    it('doesn\'t do any splitting when dates have different years', function() {
      var s = $.fullCalendar.formatRange('2014-01-01', '2015-01-01', 'MMMM Do YYYY', null, true)
      expect(s).toEqual('January 1st 2015 - January 1st 2014')
    })

    it('splits correctly on day when dates have same month', function() {
      var s = $.fullCalendar.formatRange('2014-01-01', '2014-01-05', 'MMMM Do YYYY', null, true)
      expect(s).toEqual('January 5th - 1st 2014')
    })

    it('splits correctly on day when dates have same month and smaller unit in front', function() {
      var s = $.fullCalendar.formatRange('2014-01-01', '2014-01-05', 'dddd MMMM Do YYYY', null, true)
      expect(s).toEqual('Sunday January 5th - Wednesday January 1st 2014')
    })

    it('splits correctly on the time when dates have the same day', function() {
      var s = $.fullCalendar.formatRange('2014-01-01T06:00:00', '2014-01-01T08:00:00', 'MMMM Do YYYY h:mma', null, true)
      expect(s).toEqual('January 1st 2014 8:00am - 6:00am')
    })

    it('splits correctly on the time when dates have the same day and hour but different am/pm', function() {
      var s = $.fullCalendar.formatRange('2014-01-01T06:00:00', '2014-01-01T18:00:00', 'MMMM Do YYYY h:mma', null, true)
      expect(s).toEqual('January 1st 2014 6:00pm - 6:00am')
    })

    it('splits correctly on the time when the dates have the same hour', function() {
      var s = $.fullCalendar.formatRange('2014-01-01T06:00:00', '2014-01-01T06:30:00', 'MMMM Do YYYY h:mma', null, true)
      expect(s).toEqual('January 1st 2014 6:30am - 6:00am')
    })

    it('outputs the single date when the dates have the same day and time', function() {
      var s = $.fullCalendar.formatRange('2014-01-01T06:00:00', '2014-01-01T06:00:00', 'MMMM Do YYYY h:mma', null, true)
      expect(s).toEqual('January 1st 2014 6:00am')
    })

    it('outputs the single date when the dates have the same day and the format string is vague', function() {
      var s = $.fullCalendar.formatRange('2014-01-01', '2014-01-01', 'MMMM Do YYYY', null, true)
      expect(s).toEqual('January 1st 2014')
    })

    it('uses a custom separator', function() {
      var s = $.fullCalendar.formatRange(
        '2014-01-01T06:00:00',
        '2014-01-01T06:30:00',
        'MMMM Do YYYY h:mma',
        '<...>',
        true
      )
      expect(s).toEqual('January 1st 2014 6:30am<...>6:00am')
    })

  })

  describe('when calendar has isRTL', function() {

    it('splits correctly on day when dates have same month', function() {
      initCalendar({
        defaultView: 'basicWeek',
        defaultDate: '2014-05-20',
        isRTL: true,
        titleFormat: 'MMMM Do YYYY',
        titleRangeSeparator: ' - '
      })
      expect($('.fc-toolbar h2')).toHaveText('May 24th - 18th 2014')
    })

  })

  describe('when calendar has a customized locale', function() {

    it('uses locale and splits correctly on day when dates have same month', function() {
      initCalendar({
        defaultView: 'basicWeek',
        defaultDate: '2014-05-20',
        locale: 'fr',
        titleFormat: 'dddd MMMM D YYYY',
        titleRangeSeparator: ' - '
      })
      expect($('.fc-toolbar h2')).toHaveText('lundi mai 19 - dimanche mai 25 2014')
    })

  })

  it('splits correctly on day when dates have same month, when given real moments', function() {
    var s = $.fullCalendar.formatRange(
      moment.utc('2014-01-01'),
      moment.utc('2015-01-01'),
      'MMMM Do YYYY'
    )
    expect(s).toEqual('January 1st 2014 - January 1st 2015')
  })

})
