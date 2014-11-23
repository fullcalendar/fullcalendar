
describe('constructor', function() {

	beforeEach(function() {
		affix('#calendar');
	});

	it('should return a jQuery object for chaining', function() {
		var res = $('#calendar').fullCalendar();
		expect(res instanceof jQuery).toBe(true);
	});

	it('should not modify the options object', function() {
		var options = {
			defaultView: 'agendaWeek',
			scrollTime: '09:00:00',
			slotDuration: { minutes: 45 }
		};
		var optionsCopy = $.extend({}, options, true);
		$('#calendar').fullCalendar(options);
		expect(options).toEqual(optionsCopy);
	});

	it('should not modify the events array', function() {
		var options = {
			defaultView: 'month',
			defaultDate: '2014-05-27',
			events: [
				{
					title: 'mytitle',
					start: '2014-05-27'
				}
			]
		};
		var optionsCopy = $.extend(true, {}, options); // recursive copy
		$('#calendar').fullCalendar(options);
		expect(options).toEqual(optionsCopy);
	});

	it('should not modify the eventSources array', function() {
		var options = {
			defaultView: 'month',
			defaultDate: '2014-05-27',
			eventSources: [
				{ events: [
					{
						title: 'mytitle',
						start: '2014-05-27'
					}
				] }
			]
		};
		var optionsCopy = $.extend(true, {}, options); // recursive copy
		$('#calendar').fullCalendar(options);
		expect(options).toEqual(optionsCopy);
	});

	describe('when called on a div', function() {

		beforeEach(function() {
			$('#calendar').fullCalendar();
		});

		it('should contain a table fc-toolbar', function() {
			var header = $('#calendar > .fc-toolbar');
			expect(header[0]).not.toBeUndefined();
		});

		it('should contain a div fc-view-container', function() {
			var content = ($('#calendar > .fc-view-container'));
			expect(content[0]).not.toBeUndefined();
		});

		it('should only contain 2 elements', function() {
			var calenderNodeCount = $('#calendar >').length;
			expect(calenderNodeCount).toEqual(2);
		});

		describe('and then called again', function() {
			it('should still only have a single set of calendar [header,content]', function() {
				$('#calendar').fullCalendar();
				var count = $('#calendar >').length;
				expect(count).toEqual(2);
			});
		});
	});
});