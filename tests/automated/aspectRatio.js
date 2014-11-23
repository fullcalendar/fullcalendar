
describe('aspectRatio', function() {

	beforeEach(function() {
		affix('#cal');
	});

	describe('when default settings are used', function() {
		beforeEach(function() {
			$('#cal').width(675);
			$('#cal').fullCalendar();
		});
		it('fc-content should use the ratio 1:35 to set height', function() {
			var height = $('.fc-view-container').height();
			expect(height).toEqual(500);
		});
		it('fc-content should have width of div', function() {
			var width = $('.fc-view-container').width();
			expect(width).toEqual(675);
		});
	});

	describe('when initializing the aspectRatio', function() {

		describe('to 2', function() {
			beforeEach(function() {
				$('#cal').width(1000);
				$('#cal').fullCalendar({
					aspectRatio: 2
				});
			});
			it('should not change the width', function() {
				var width = $('.fc-view-container').width();
				expect(width).toEqual(1000);
			});
			it('should set the height to width sizes very close to ratio of 2', function() {
				var width = $('.fc-view-container').width();
				var height = $('.fc-view-container').height();
				var ratio = Math.round(width / height * 100);
				expect(ratio).toEqual(200);
			});
		});

		describe('to 1', function() {
			beforeEach(function() {
				$('#cal').width(1000);
				$('#cal').fullCalendar({
					aspectRatio: 1
				});
			});
			it('should not change the width', function() {
				var width = $('.fc-view-container').width();
				expect(width).toEqual(1000);
			});
			it('should set the height to width sizes very close to ratio of 2', function() {
				var width = $('.fc-view-container').width();
				var height = $('.fc-view-container').height();
				var ratio = Math.round(width / height * 100);
				expect(ratio).toEqual(100);
			});
		});

		describe('to less than 0.5', function() {
			beforeEach(function() {
				$('#cal').width(1000);
				$('#cal').fullCalendar({
					aspectRatio: 0.4
				});
			});
			it('should not change the width', function() {
				var width = $('.fc-view-container').width();
				expect(width).toEqual(1000);
			});
			it('should set the height to width ratio to 0.5', function() {
				var width = $('.fc-view-container').width();
				var height = $('.fc-view-container').height();
				var ratio = Math.round(width / height * 100);
				expect(ratio).toEqual(50);
			});
		});

		describe('to negative', function() {
			beforeEach(function() {
				$('#cal').width(1000);
				$('#cal').fullCalendar({
					aspectRatio: -2
				});
			});
			it('should not change the width', function() {
				var width = $('.fc-view-container').width();
				expect(width).toEqual(1000);
			});
			it('should set the height to width ratio to 0.5', function() {
				var width = $('.fc-view-container').width();
				var height = $('.fc-view-container').height();
				var ratio = Math.round(width / height * 100);
				expect(ratio).toEqual(50);
			});
		});

		describe('to zero', function() {
			beforeEach(function() {
				$('#cal').width(1000);
				$('#cal').fullCalendar({
					aspectRatio: 0
				});
			});
			it('should not change the width', function() {
				var width = $('.fc-view-container').width();
				expect(width).toEqual(1000);
			});
			it('should set the height to width ratio to 0.5', function() {
				var width = $('.fc-view-container').width();
				var height = $('.fc-view-container').height();
				var ratio = Math.round(width / height * 100);
				expect(ratio).toEqual(50);
			});
		});

		describe('to very large', function() {
			beforeEach(function() {
				$('#cal').width(1000);
				$('#cal').fullCalendar({
					aspectRatio: 4000
				});
			});
			it('should not change the width', function() {
				var width = $('.fc-view-container').width();
				expect(width).toEqual(1000);
			});
			it('should cause rows to be natural height', function() {
				var actualHeight = $('.fc-view-container').height();
				$('tr.fc-week td:first-child > div').css('min-height', '').css('background', 'red');
				var naturalHeight = $('.fc-view-container').height();
				expect(actualHeight).toEqual(naturalHeight);
			});
		});
	});
});