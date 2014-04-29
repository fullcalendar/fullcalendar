
describe('constructor', function() {

	beforeEach(function() {
		affix('#calendar');
	});

	it('should return a jQuery object for chaining', function() {
		var res = $('#calendar').fullCalendar();
		expect(res instanceof jQuery).toBe(true);
	});

	describe('when called on a div', function() {

		beforeEach(function() {
			$('#calendar').fullCalendar();
		});

		it('should contain a table fc-header', function() {
			var header = $('#calendar > table.fc-header');
			expect(header[0]).not.toBeUndefined();
		});

		it('should contain a div fc-content', function() {
			var content = ($('#calendar > div.fc-content'));
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