
describe('moment date formatting', function() {

  it('should let vanilla momentjs formatting to work correctly', function() {
    var mom = $.fullCalendar.moment.utc('2014-05-20T14:00:00')
    var s1 = mom.format('dddd, MMMM Do YYYY, h:mm:ss a')
    var s2 = mom.format('ddd, hA Z')
    expect(s1).toEqual('Tuesday, May 20th 2014, 2:00:00 pm')
    expect(s2).toEqual('Tue, 2PM +00:00')
  })

  it('should allow momentjs text escaping', function() {
    var mom = $.fullCalendar.moment.utc('2014-05-20T14:00:00')
    var s = mom.format('MMMM Do YYYY [TIME:] h:mm:ss a')
    expect(s).toEqual('May 20th 2014 TIME: 2:00:00 pm')
  })

  it('should correctly output LT (regression)', function() {
    var mom = $.fullCalendar.moment.utc('2014-05-20T06:00:00')
    var s = mom.format('ddd, LT')
    expect(s).toEqual('Tue, 6:00 AM')
  })

  it('should correctly output hT (regression)', function() {
    var mom = $.fullCalendar.moment.utc('2014-05-20T06:00:00')
    var s = mom.format('ddd, hT')
    expect(s).toEqual('Tue, 6A')
  })

  it('should output A/P with the \'T\' formatting character', function() {
    var mom1 = $.fullCalendar.moment.utc('2014-05-20T06:00:00')
    var mom2 = $.fullCalendar.moment.utc('2014-05-20T14:00:00')
    var s1 = mom1.format('ddd, h T')
    var s2 = mom2.format('ddd, h T')
    expect(s1).toEqual('Tue, 6 A')
    expect(s2).toEqual('Tue, 2 P')
  })

  it('should output A/P with the \'t\' formatting character', function() {
    var mom1 = $.fullCalendar.moment.utc('2014-05-20T06:00:00')
    var mom2 = $.fullCalendar.moment.utc('2014-05-20T14:00:00')
    var s1 = mom1.format('ddd, h t')
    var s2 = mom2.format('ddd, h t')
    expect(s1).toEqual('Tue, 6 a')
    expect(s2).toEqual('Tue, 2 p')
  })

  it('should output non-zero numbers enclosed in parenthesis', function() {
    var mom = $.fullCalendar.moment.utc('2014-05-20T06:30:00')
    var s = mom.format('ddd h(:mm)a')
    expect(s).toEqual('Tue 6:30am')
  })

  it('should not output zero numbers enclosed in parenthesis', function() {
    var mom = $.fullCalendar.moment.utc('2014-05-20T06:00:00')
    var s = mom.format('ddd h(:mm)a')
    expect(s).toEqual('Tue 6am')
  })

  it('should allow escaping of parenthesis as literal text', function() {
    var mom = $.fullCalendar.moment.utc('2014-05-20T06:00:00')
    var s1 = mom.format('ddd h[(]:mm)a')
    // var s2 = mom.format('ddd h(:mm[)]a'); // we currently cant nest [] inside ()
    expect(s1).toEqual('Tue 6(:00)am')
    // expect(s2).toEqual('Tue 6(:00)am');
  })

  it('should not allow custom fullCalendar formatting for moments created natively', function() {
    var mom = moment.utc('2014-11-11T12:00:00')
    var s = mom.format('MMMM Do YYYY, h(:mm)')
    expect(s).toEqual('November 11th 2014, 12(:00)')
  })

})
