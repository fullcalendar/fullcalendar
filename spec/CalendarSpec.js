describe("Calendar", function() {
  var calendar;
  var year = 2012;
  var month = 9 - 1;

  beforeEach(function() {
    calendar = $("<div>").attr('id', 'calendar');
    $('body').append(calendar);
    calendar.fullCalendar({}).fullCalendar('gotoDate', year, month);
  });

  it("should append year and month on header", function() {
    expect(calendar.find('.fc-header-title h2').text()).toBe("September 2012");
  });
});