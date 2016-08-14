
describe('locale', function() {

	afterEach(function() {
		moment.locale('en');
	});

	it('is not affected by global moment locale when unset', function() {
		moment.locale('fr');
		affix('#cal');
		$('#cal').fullCalendar();
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-05-01');
		var s = mom.format('dddd MMMM Do YYYY');
		expect(s).toEqual('Thursday May 1st 2014');
	});

	it('is not affected by global moment locale when unset', function() {
		moment.locale('fr');
		affix('#cal');
		$('#cal').fullCalendar({
			locale: 'es'
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-05-01');
		var s = mom.format('dddd MMMM Do YYYY');
		expect(s).toEqual('jueves mayo 1º 2014');
	});

	it('doesn\'t side-effect the global moment locale when customized', function() {
		moment.locale('fr');
		affix('#cal');
		$('#cal').fullCalendar({
			locale: 'es'
		});
		var mom = moment.utc('2014-05-01');
		var s = mom.format('dddd MMMM Do YYYY');
		expect(s).toEqual('jeudi mai 1er 2014');
		expect(moment.locale()).toEqual('fr');
	});

	// the most recent version of moment will actually throw a cryptic exception,
	// and instead of papering over this, just let it be thrown. will indicate that something
	// needs to be fixed to the developer.
	/*
	xit('defaults to English when configured to locale that isn\'t loaded', function() {
		affix('#cal');
		$('#cal').fullCalendar({
			locale: 'zz'
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-05-01');
		var s = mom.format('dddd MMMM Do YYYY');
		expect(s).toEqual('Thursday May 1st 2014');
	});
	*/

	it('works when certain locale has no FC settings defined', function() {
		affix('#cal');
		$('#cal').fullCalendar({
			locale: 'en-ca',
			defaultView: 'agendaWeek',
			defaultDate: '2014-12-25',
			events: [
				{ title: 'Christmas', start: '2014-12-25T10:00:00' }
			]
		});
		expect($('.fc-day-header:first')).toHaveText('Sun 12-21');
		expect($('.fc-event .fc-time')).toHaveText('10:00');
	});

	it('allows dynamic setting', function() {
		affix('#cal');
		$('#cal').fullCalendar({
			locale: 'es',
			defaultDate: '2016-07-10',
			defaultView: 'month'
		});
		expect($('.fc h2')).toHaveText('julio 2016');
		expect($('.fc')).not.toHaveClass('fc-rtl');

		$('#cal').fullCalendar('option', 'locale', 'ar');
		expect($('.fc h2')).toHaveText('تموز يوليو ٢٠١٦');
		expect($('.fc')).toHaveClass('fc-rtl');
	});

});
