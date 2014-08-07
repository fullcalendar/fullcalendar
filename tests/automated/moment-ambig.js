
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
		expect(clone).not.toBe(mom);
		clone.add(1, 'months');
		expect(+clone).not.toBe(+mom);
	});

	it('can be given a zone via utc', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.utc();
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(true);
		expect(mom.zone()).toBe(0);
	});

	it('can be given a zone via local', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		var equivDate = new Date(Date.UTC(2014, 5, 8, 10, 0, 0));
		expect(mom.toArray()).toEqual([ 2014, 5, 8, 10, 0, 0, 0 ]);
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.local();
		expect(mom.toArray()).toEqual([ 2014, 5, 8, 10, 0, 0, 0 ]);
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(true);
		expect(mom.zone()).toBe(equivDate.getTimezoneOffset());
	});

	it('can be given a zone via zone', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08T10:00:00');
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.zone(-420);
		expect(mom.hasTime()).toBe(true);
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
		expect(clone).not.toBe(mom);
		clone.add(1, 'months');
		expect(+clone).not.toBe(+mom);
	});

	it('can be given a time', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		expect(mom.hasTime()).toBe(false);
		var time = moment.duration({ hours: 1, minutes: 25 });
		mom.time(time);
		expect(mom.hasTime()).toBe(true);
		expect(+mom.time()).toBe(+time);
	});

	it('can be given a time and zone via utc', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		expect(mom.hasTime()).toBe(false);
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.utc();
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(true);
		expect(mom.zone()).toBe(0);
	});

	it('can be given a time and zone via local', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		var equivDate = new Date(2014, 5, 8, 10, 0, 0);
		expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ]);
		expect(mom.hasTime()).toBe(false);
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.local();
		expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ]);
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(true);
		expect(mom.zone()).toBe(equivDate.getTimezoneOffset());
	});

	it('can be given a time and zone via zone', function() {
		var mom = $.fullCalendar.moment.parseZone('2014-06-08');
		expect(mom.hasTime()).toBe(false);
		expect(mom.hasZone()).toBe(false);
		expect(mom.zone()).toBe(0);
		mom.zone(-420);
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(true);
		expect(mom.zone()).toBe(-420);
	});

});

describe('unambiguous moment', function() {

	it('can be made ambiguously-zoned via stripZone', function() {
		var mom = $.fullCalendar.moment.utc('2014-06-08T10:00:00-0000');
		expect(mom.hasZone()).toBe(true);
		expect(mom.hasTime()).toBe(true);
		mom.stripZone();
		expect(mom.format()).toBe('2014-06-08T10:00:00');
		expect(mom.hasZone()).toBe(false);
		expect(mom.hasTime()).toBe(true);
	});

	it('can be made ambigously-timed via stripTime', function() {
		var mom = $.fullCalendar.moment.utc('2014-06-08T10:00:00-0000');
		expect(mom.hasTime()).toBe(true);
		expect(mom.hasZone()).toBe(true);
		mom.stripTime();
		expect(mom.format()).toBe('2014-06-08');
		expect(mom.hasTime()).toBe(false);
		expect(mom.hasZone()).toBe(false);
	});

});
