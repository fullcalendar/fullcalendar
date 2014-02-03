
describe('$.fullCalendar.moment', function() {

	describe('when given an existing moment', function() {

		it('has no side effects', function() {
			var oldMom = moment();
			var oldDate = oldMom.toDate();
			var newMom = $.fullCalendar.moment(oldMom).add('months', 1);
			var newDate = newMom.toDate();
			expect(+oldDate).not.toBe(+newDate);
		});

		it('transfers all ambiguity', function() {
			var oldMom = $.fullCalendar.moment('2014-06-06');
			expect(oldMom.hasZone()).toBe(false);
			expect(oldMom.hasTime()).toBe(false);
			var newMom = $.fullCalendar.moment(oldMom);
			expect(newMom.hasZone()).toBe(false);
			expect(newMom.hasTime()).toBe(false);
		});

	});

	describe('when given an ISO8601 string', function() {

		it('assumes local when no TZO', function() {
			var mom = $.fullCalendar.moment('2014-06-08T10:00:00');
			var dateEquiv = new Date(2014, 5, 8, 10, 0, 0);
			expect(mom.format()).toContain('2014-06-08T10:00:00');
			expect(mom.zone()).toBe(dateEquiv.getTimezoneOffset());
		});

		it('is local regardless of inputted zone', function() {
			var mom = $.fullCalendar.moment('2014-06-08T10:00:00+0130');
			var simpleMoment = moment('2014-06-08T10:00:00+0130');
			expect(mom.zone()).toBe(mom.zone());
		});

		it('accepts an ambiguous time', function() {
			var mom = $.fullCalendar.moment('2014-06-08');
			expect(mom.format()).toBe('2014-06-08');
			expect(mom.hasTime()).toBe(false);
		});

		it('assumes first-of-month and ambiguous time when no date-of-month', function() {
			var mom = $.fullCalendar.moment('2014-06');
			expect(mom.format()).toBe('2014-06-01');
			expect(mom.hasTime()).toBe(false);
		});

	});

	it('is local when given no arguments', function() {
		var mom = $.fullCalendar.moment();
		var nowDate = new Date();
		expect(mom.zone()).toBe(nowDate.getTimezoneOffset());
	});

	it('is local when given a native Date', function() {
		var date = new Date();
		var mom = $.fullCalendar.moment(date);
		expect(mom.zone()).toBe(date.getTimezoneOffset());
	});

	it('is local when given an array', function() {
		var a = [ 2014, 5, 8, 10, 0, 0 ];
		var date = new Date(2014, 5, 8, 10, 0, 0);
		var mom = $.fullCalendar.moment(a);
		expect(mom.format()).toContain('2014-06-08');
		expect(mom.zone()).toBe(date.getTimezoneOffset());
	});

});

describe('$.fullCalendar.moment.utc', function() {

	describe('when given an ISO8601 string', function() {

		it('assumes UTC when no TZO', function() {
			var mom = $.fullCalendar.moment.utc('2014-06-08T10:00:00');
			expect(mom.format()).toContain('2014-06-08T10:00:00');
			expect(mom.zone()).toBe(0);
		});

		it('is UTC regardless of inputted zone', function() {
			var mom = $.fullCalendar.moment.utc('2014-06-08T10:00:00+0130');
			expect(mom.zone()).toBe(0);
		});

		it('accepts an ambiguous time', function() {
			var mom = $.fullCalendar.moment.utc('2014-06-08');
			expect(mom.format()).toBe('2014-06-08');
			expect(mom.hasTime()).toBe(false);
		});

		it('assumes first-of-month and ambiguous time when no date-of-month', function() {
			var mom = $.fullCalendar.moment.utc('2014-06');
			expect(mom.format()).toBe('2014-06-01');
			expect(mom.hasTime()).toBe(false);
		});

	});

	it('is UTC when given no arguments', function() {
		var mom = $.fullCalendar.moment.utc();
		expect(mom.zone()).toBe(0);
	});

	it('is UTC when given a native Date', function() {
		var date = new Date();
		var mom = $.fullCalendar.moment.utc(date);
		expect(mom.zone()).toBe(0);
	});

	it('is UTC when given an array', function() {
		var a = [ 2014, 5, 8, 10, 0, 0 ];
		var mom = $.fullCalendar.moment.utc(a);
		expect(mom.format()).toContain('2014-06-08');
		expect(mom.zone()).toBe(0);
	});

});

describe('$.fullCalendar.moment.parseZone', function() {

	describe('when given an ISO8601 string', function() {

		it('accepts the inputted TZO', function() {
			var mom = $.fullCalendar.moment.parseZone('2014-06-08T11:00:00+0130');
			expect(mom.zone()).toBe(-90);
		});

		it('accepts an ambiguous zone', function() {
			var mom = $.fullCalendar.moment.parseZone('2014-06-08T11:00:00');
			expect(mom.format()).toContain('2014-06-08T11:00:00');
			expect(mom.hasZone()).toBe(false);
		});

		it('accepts an ambiguous time', function() {
			var mom = $.fullCalendar.moment.parseZone('2014-06-08');
			expect(mom.format()).toContain('2014-06-08');
			expect(mom.hasTime()).toBe(false);
		});

		it('assumes first-of-month and ambiguous time when no date-of-month', function() {
			var mom = $.fullCalendar.moment.parseZone('2014-06');
			expect(mom.format()).toBe('2014-06-01');
			expect(mom.hasTime()).toBe(false);
		});

	});

	it('is local when given no arguments', function() {
		var mom = $.fullCalendar.moment.parseZone();
		var nowDate = new Date();
		expect(mom.zone()).toBe(nowDate.getTimezoneOffset());
	});

	it('is local when given a native Date', function() {
		var date = new Date();
		var mom = $.fullCalendar.moment.parseZone(date);
		expect(mom.zone()).toBe(date.getTimezoneOffset());
	});

	it('is ambiguously zoned when given an array', function() {
		var a = [ 2014, 5, 8, 10, 0, 0 ];
		var mom = $.fullCalendar.moment.parseZone(a);
		expect(mom.format()).toContain('2014-06-08');
		expect(mom.hasZone()).toBe(false);
	});

});

describe('ambiguously-zoned moment', function() {

	it('has a false hasZone', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.hasZone()).toBe(false);
	});

	it('has a true hasTime', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.hasTime()).toBe(true);
	});

	it('has a zero zone', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.zone()).toBe(0);
	});

	it('formats without a zone part', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.format()).toBe('2014-06-08T10:00:00');
	});

	it('formats via toISOString without a zone part', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.toISOString()).toBe('2014-06-08T10:00:00');
	});

	it('is correctly cloned', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		var clone = mom.clone();
		expect(clone.hasZone()).toBe(false);
		expect(clone.format()).toBe('2014-06-08T10:00:00');
	});

	it('can be give a zone via utc', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.utc();
		expect(mom.hasZone()).toBe(true);
		expect(mom.zone()).toBe(0);
	});

	it('can be give a zone via local', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		var equivDate = new Date(Date.UTC(2014, 5, 8, 10, 0, 0));
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.local();
		expect(mom.hasZone()).toBe(true);
		expect(mom.zone()).toBe(equivDate.getTimezoneOffset());
	});

	it('can be give a zone via zone', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.zone(-420);
		expect(mom.hasZone()).toBe(true);
		expect(mom.zone()).toBe(-420);
	});

});

describe('ambiguously-timed moment', function() {

	it('has a false hasTime', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		expect(mom.hasTime()).toBe(false);
	});

	it('has a false hasZone', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		expect(mom.hasZone()).toBe(false);
	});

	it('has a zero time', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		var time = mom.time();
		expect(+time).toBe(0);
	});

	it('formats without a zone part', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		expect(mom.format()).toBe('2014-06-08');
	});

	it('formats via toISOString without a time part', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		expect(mom.toISOString()).toBe('2014-06-08');
	});

	it('is correctly cloned', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		var clone = mom.clone();
		expect(clone.hasTime()).toBe(false);
		expect(clone.format()).toBe('2014-06-08');
	});

	it('can be given a time', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		expect(mom.hasTime()).toBe(false);
		var time = moment.duration({ hours: 1, minutes: 25 });
		mom.time(time);
		expect(mom.hasTime()).toBe(true);
		expect(+mom.time()).toBe(+time);
	});

});

describe('unambiguous moment', function() {

	it('can be made ambiguously-zoned via stripZone', function() {
		var mom = $.fullCalendar.moment('2014-06-08T10:00:00-0700');
		expect(mom.hasZone()).toBe(true);
		expect(mom.hasTime()).toBe(true);
		mom.stripZone();
		expect(mom.format()).toBe('2014-06-08T10:00:00');
		expect(mom.hasZone()).toBe(false);
		expect(mom.hasTime()).toBe(true);
	});

	it('can be made ambigously-timed via stripTime', function() {
		var mom = $.fullCalendar.moment('2014-06-08T10:00:00-0700');
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(true);
		mom.stripTime();
		expect(mom.format()).toBe('2014-06-08');
		expect(mom.hasTime()).toBe(false);
		expect(mom.hasZone()).toBe(false);
	});

});

describe('Calendar::moment', function() {

	beforeEach(function() {
		affix('#cal');
	});

	it('inherits the calendar\'s lang', function() {
		$('#cal').fullCalendar({
			lang: 'fr'
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-06-08T10:00:00');
		expect(mom.lang()._abbr).toBe('fr');
	});

	it('is ambiguously-zoned when the calendar has no timezone', function() {
		$('#cal').fullCalendar({
			timezone: false
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-06-08T10:00:00');
		expect(mom.hasZone()).toBe(false);
	});

	it('is local when calendar is local', function() {
		$('#cal').fullCalendar({
			timezone: 'local'
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-06-08T10:00:00');
		var equivDate = new Date(2014, 5, 8, 10, 0, 0);
		expect(mom.zone()).toBe(equivDate.getTimezoneOffset());
	});

	it('is UTC when the calendar is UTC', function() {
		$('#cal').fullCalendar({
			timezone: 'UTC'
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-06-08T10:00:00');
		expect(mom.zone()).toBe(0);
	});

	it('is ambuously-zoned when the calendar has a custom timezone', function() {
		$('#cal').fullCalendar({
			timezone: 'America/Chicago'
		});
		var calendar = $('#cal').fullCalendar('getCalendar');
		var mom = calendar.moment('2014-06-08T10:00:00');
		expect(mom.hasZone()).toBe(false);
	});

});
