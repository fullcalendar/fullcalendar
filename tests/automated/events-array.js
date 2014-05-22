
describe('events as an array', function() {

	var options;
	var eventArray;

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultView: 'month',
			defaultDate: '2014-05-01'
		};
		eventArray = [
			{
				title: 'my event',
				start: '2014-05-21'
			}
		];
	});

	it('accepts an event using basic form', function(done) {
		options.events = eventArray;
		options.eventRender = function(eventObj, eventElm) {
			expect(eventObj.title).toEqual('my event');
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('accepts an event using extended form', function(done) {
		options.eventSources = [
			{
				className: 'customeventclass',
				events: eventArray
			}
		];
		options.eventRender = function(eventObj, eventElm) {
			expect(eventObj.title).toEqual('my event');
			expect(eventElm).toHaveClass('customeventclass');
			done();
		};
		$('#cal').fullCalendar(options);
	});

	it('doesn\'t mutate the original array', function(done) {
		var origArray = eventArray;
		var origEvent = eventArray[0];
		options.events = eventArray;
		options.eventRender = function(eventObj, eventElm) {
			expect(origArray).toEqual(eventArray);
			expect(origEvent).toEqual(eventArray[0]);
			done();
		};
		$('#cal').fullCalendar(options);
	});

});
