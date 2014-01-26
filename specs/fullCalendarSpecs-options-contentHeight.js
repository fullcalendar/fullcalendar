
describe('contentHeight', function() {

	beforeEach(function() {
		affix('#cal');
		$('#cal').width(900);
	});

	describe('when the default options are used', function() {
		it('should set the height', function() {
			$('#cal').width(1350);
			$('#cal').fullCalendar();
			var height = $('.fc-content').height();
			expect(height).toEqual(1000);
		});
	});

	describe('when the content height is set', function() {
		it('should set the content height', function() {
			$('#cal').fullCalendar({
				contentHeight: 1000
			});
			var height = $('.fc-content').height();
			expect(height).toEqual(1000);
		});
		it('should not change the container width', function() {
			$('#cal').fullCalendar({
				contentHeight: 1000
			});
			var width = $('#cal').width();
			expect(width).toEqual(900);
		});
	});

	describe('when the content height setter is used', function() {
		it('should set the content height', function() {
			$('#cal').fullCalendar();
			$('#cal').fullCalendar('option', 'contentHeight', 1137);
			var height = $('.fc-content').height();
			expect(height).toEqual(1137);
		});
		it('should not change the container width', function() {
			$('#cal').fullCalendar();
			$('#cal').fullCalendar('option', 'contentHeight', 1137);
			var width = $('#cal').width();
			expect(width).toEqual(900);
		});
	});
});