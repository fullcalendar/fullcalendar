describe('destroy', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when calendar is LTR', function() {
		it('cleans up all classNames on the root element', function() {
			$('#cal').fullCalendar({
				isRTL: false
			});
			$('#cal').fullCalendar('destroy');
			expect($('#cal')[0].className).toBe('');
		});
	});

	describe('when calendar is RTL', function() {
		it('cleans up all classNames on the root element', function() {
			$('#cal').fullCalendar({
				isRTL: true
			});
			$('#cal').fullCalendar('destroy');
			expect($('#cal')[0].className).toBe('');
		});
	});

});