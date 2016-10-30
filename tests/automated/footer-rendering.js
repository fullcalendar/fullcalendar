
describe('footer rendering', function() {

	beforeEach(function() {
		affix('#calendar');
	});

	describe('when supplying footer options', function() {
		beforeEach(function() {
			var options = {
				footer: {
					left: 'next,prev',
					center: 'prevYear today nextYear agendaView,dayView',
					right: 'title'
				}
			};
			$('#calendar').fullCalendar(options);
		});
		it('should append a .fc-footer-toolbar to the DOM', function() {
			var footer = $('#calendar .fc-footer-toolbar');
			expect(footer.length).toBe(1);
		});
	});

	describe('when setting footer to false', function() {
		beforeEach(function() {
			var options = {
				footer: false
			};
			$('#calendar').fullCalendar(options);
		});
		it('should not have footer table', function() {
			expect($('.fc-footer-toolbar')).not.toBeInDOM();
		});
	});

	it('allow for dynamically changing', function() {
		var options = {
			footer: {
				left: 'next,prev',
				center: 'prevYear today nextYear agendaView,dayView',
				right: 'title'
			}
		};
		$('#calendar').fullCalendar(options);
		expect($('.fc-footer-toolbar')).toBeInDOM();
		$('#calendar').fullCalendar('option', 'footer', false);
		expect($('.fc-footer-toolbar')).not.toBeInDOM();
	});

});
