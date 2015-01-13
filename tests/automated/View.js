describe('View object', function() {

	var options;

	/*
	TODO: move tests from eventLimitClick.js about view.name/type into here
	*/

	beforeEach(function() {
		affix('#cal');
		options = {
			defaultDate: '2015-01-01'
		};
	});

	describe('title', function() {

		it('is a correctly defined string', function() {
			$('#cal').fullCalendar(options);
			var view = $('#cal').fullCalendar('getView');
			expect(view.title).toBe('January 2015');
		});

		it('is available in the viewRender callback', function() {
			options.viewRender = function(view) {
				expect(view.title).toBe('January 2015');
			};
			spyOn(options, 'viewRender').and.callThrough();
			$('#cal').fullCalendar(options);
			expect(options.viewRender).toHaveBeenCalled();
		});
	});
});