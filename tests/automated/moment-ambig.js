
describe('ambiguously-timed moment', function() {

	it('formats without a time and timezone part', function() {
		var date = moment.utc('2014-01-01T06:00:00+00:00').stripTime();
		var s = date.format();
		expect(s).toEqual('2014-01-01');
	});

	it('is still ambuously-timed after being cloned', function() {
		var date = moment('2014-01-01T06:00:00-07:00').stripTime();
		var clone = date.clone();
		expect(date.hasTime()).toEqual(false);
		expect(clone.hasTime()).toEqual(false);
	});

});

describe('ambiguously-zoned moment', function() {

	it('formats without a timezone part', function() {
		var date = moment.utc('2014-01-01T06:00:00+00:00').stripZone();
		var s = date.format();
		expect(s).toEqual('2014-01-01T06:00:00');
	});

	it('is still ambiguously-zoned after being cloned', function() {
		var date = moment('2014-01-01T06:00:00-07:00').stripZone();
		var clone = date.clone();
		expect(date.hasZone()).toEqual(false);
		expect(clone.hasZone()).toEqual(false);
	});

});

// TODO: also for $.fullCalendar.moment() and calendar.moment()