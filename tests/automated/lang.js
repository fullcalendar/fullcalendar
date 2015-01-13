
describe('lang', function() {

	afterEach(function() {
		moment.lang('en');
	});

	it('is not affected by global moment lang when unset', function() {
		moment.lang('fr');
		affix('#cal');
		$('#cal').fullCalendar();
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-05-01');
		var s = mom.format('dddd MMMM Do YYYY');
		expect(s).toEqual('Thursday May 1st 2014');
	});

	it('is not affected by global moment lang when unset', function() {
		moment.lang('fr');
		affix('#cal');
		$('#cal').fullCalendar({
			lang: 'es'
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-05-01');
		var s = mom.format('dddd MMMM Do YYYY');
		expect(s).toEqual('jueves mayo 1º 2014');
	});

	it('doesn\'t side-effect the global moment lang when customized', function() {
		moment.lang('fr');
		affix('#cal');
		$('#cal').fullCalendar({
			lang: 'es'
		});
		var mom = moment.utc('2014-05-01');
		var s = mom.format('dddd MMMM Do YYYY');
		expect(s).toEqual('jeudi mai 1er 2014');
		expect(moment.lang()).toEqual('fr');
	});

	it('defaults to English when configured to language that isn\'t loaded', function() {
		affix('#cal');
		$('#cal').fullCalendar({
			lang: 'zz'
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-05-01');
		var s = mom.format('dddd MMMM Do YYYY');
		expect(s).toEqual('Thursday May 1st 2014');
	});

	it('works when certain language has no FC settings defined', function() {
		affix('#cal');
		$('#cal').fullCalendar({
			lang: 'en-ca',
			defaultView: 'agendaWeek',
			defaultDate: '2014-12-25',
			events: [
				{ title: 'Christmas', start: '2014-12-25T10:00:00' }
			]
		});
		expect($('.fc-day-header:first')).toHaveText('Sun 12-21');
		expect($('.fc-event .fc-time')).toHaveText('10:00');
	});

});