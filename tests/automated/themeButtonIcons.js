describe('themeButtonIcons', function() {

	var options;
	var defaultSelectors = [
		'.ui-icon-circle-triangle-w',
		'.ui-icon-circle-triangle-e',
		'.ui-icon-seek-prev',
		'.ui-icon-seek-next'
	];

	beforeEach(function() {
		affix('#cal');
		options = {
			header: {
				left: 'prevYear,prev,next,nextYear today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			}
		};
	});

	describe('when theme is off', function() {
		beforeEach(function() {
			options.theme = false;
		});
		it('should not have any of the default theme icon classes', function() {
			$('#cal').fullCalendar(options);
			defaultSelectors.forEach(function(selector) {
				expect($(selector)).not.toBeInDOM();
			});
		});
	});

	describe('when theme is on', function() {

		beforeEach(function() {
			options.theme = true;
		});

		it('should have all of the deafult theme icon classes', function() {
			$('#cal').fullCalendar(options);
			defaultSelectors.forEach(function(selector) {
				expect($(selector)).toBeInDOM();
			});
		});

		it('should accept values that override the individual defaults', function() {
			options.themeButtonIcons = {
				prev: 'arrowthickstop-1-w',
				next: 'arrowthickstop-1-e'
			};
			$('#cal').fullCalendar(options);
			[
				'.ui-icon-arrowthickstop-1-w',
				'.ui-icon-arrowthickstop-1-e',
				'.ui-icon-seek-prev', // prev/next year should remain
				'.ui-icon-seek-next'  //
			]
			.forEach(function(selector) {
				expect($(selector)).toBeInDOM();
			});
		});
	});

});