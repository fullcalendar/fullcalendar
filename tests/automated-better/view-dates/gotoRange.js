/*
SEE ALSO:
- visibleRange (for core of range setting and constraining)
*/
describe('gotoRange', function() {
	pushOptions({
		defaultView: 'agenda',
		visibleRange: {
			start: '2017-06-15',
			end: '2017-06-18'
		}
	});

	xit('navigates to a given range', function() {
		initCalendar();
		currentCalendar.gotoRange({
			start: '2017-07-01',
			end: '2017-07-05'
		});
		ViewDateUtils.expectVisibleRange('2017-07-01', '2017-07-05');
	});

	describe('when navigating to an invalid range', function() {
		var startVal = '2017-06-05';
		var endVal = '2017-06-04';

		xit('reports an error and stays at current range', function() {
			initCalendar();
			currentCalendar.gotoRange({ start: startVal, end: endVal });
			ViewDateUtils.expectVisibleRange('2017-06-15', '2017-06-18');
			// TODO: detect error reporting
		});
	});

	describe('when new range is same as old', function() {
		var startVal = '2017-06-15';
		var endVal = '2017-06-18';

		xit('does not rerender', function() {
			var viewRenderCalled = false;

			initCalendar({
				viewRender: function() {
					viewRenderCalled = true;
				}
			});
			currentCalendar.gotoRange({ start: startVal, end: endVal });
			ViewDateUtils.expectVisibleRange('2017-06-15', '2017-06-18');
			expect(viewRenderCalled).toBe(false);
		});
	});
});
