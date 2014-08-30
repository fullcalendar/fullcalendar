
describe('TimeGrid event rendering', function() {
	var options;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2014-08-23',
			defaultView: 'agendaWeek',
			scrollTime: '00:00:00'
		};
	});

	it('renders the start and end time of an event that spans only 1 day', function() {
		options.events = [ {
			title: 'event1',
			start: '2014-08-18T02:00:00',
			end: '2014-08-18T22:00:00'
		} ];
		$('#cal').fullCalendar(options);
		expect('.fc-event .fc-time').toHaveText('2:00 - 10:00');
	});

	it('renders time to/from midnight for an event that spans two days', function() {
		options.events = [ {
			title: 'event1',
			start: '2014-08-18T02:00:00',
			end: '2014-08-19T22:00:00'
		} ];
		$('#cal').fullCalendar(options);
		var seg1 = $('.fc-event:eq(0)');
		var seg2 = $('.fc-event:eq(1)');
		expect(seg1.find('.fc-time')).toHaveText('2:00 - 12:00');
		expect(seg2.find('.fc-time')).toHaveText('12:00 - 10:00');
	});

	it('renders no time on an event segment that spans through an entire day', function() {
		options.events = [ {
			title: 'event1',
			start: '2014-08-18T02:00:00',
			end: '2014-08-20T22:00:00'
		} ];
		$('#cal').fullCalendar(options);
		var seg2 = $('.fc-event:eq(1)');
		expect(seg2).toBeInDOM();
		expect(seg2.find('.fc-time')).not.toBeInDOM();
	});

	it('renders an event with no url with no <a> href', function() {
		options.events = [ {
			title: 'event1',
			start: '2014-08-18T02:00:00'
		} ];
		$('#cal').fullCalendar(options);
		var seg = $('.fc-event');
		expect(seg).not.toHaveAttr('href');
	});

	it('renders an event with a url with an <a> href', function() {
		options.events = [ {
			title: 'event1',
			start: '2014-08-18T02:00:00',
			url: 'http://google.com/'
		} ];
		$('#cal').fullCalendar(options);
		var seg = $('.fc-event');
		expect(seg).toHaveAttr('href');
	});

});