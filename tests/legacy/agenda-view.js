describe('agenda view rendering', function () {

	describe('when isRTL is false', function () {
		pushOptions({
			defaultView: 'agendaWeek',
			isRTL: false
		});

		it('should have have days ordered sun to sat', function () {
			initCalendar();
			var headers = document.querySelectorAll('.fc-view > table > thead th');
			expect(headers[0].classList.contains('fc-axis')).toBeTruthy();
			expect(headers[1].classList.contains('fc-sun')).toBeTruthy();
			expect(headers[2].classList.contains('fc-mon')).toBeTruthy();
			expect(headers[3].classList.contains('fc-tue')).toBeTruthy();
			expect(headers[4].classList.contains('fc-wed')).toBeTruthy();
			expect(headers[5].classList.contains('fc-thu')).toBeTruthy();
			expect(headers[6].classList.contains('fc-fri')).toBeTruthy();
			expect(headers[7].classList.contains('fc-sat')).toBeTruthy();
		});
	});

	describe('when isRTL is true', function () {
		pushOptions({
			defaultView: 'agendaWeek',
			isRTL: true
		});

		it('should have have days ordered sat to sun', function () {
			initCalendar();
			var headers = document.querySelectorAll('.fc-view > table > thead th');
			expect(headers[0].classList.contains('fc-sat')).toBeTruthy();
			expect(headers[1].classList.contains('fc-fri')).toBeTruthy();
			expect(headers[2].classList.contains('fc-thu')).toBeTruthy();
			expect(headers[3].classList.contains('fc-wed')).toBeTruthy();
			expect(headers[4].classList.contains('fc-tue')).toBeTruthy();
			expect(headers[5].classList.contains('fc-mon')).toBeTruthy();
			expect(headers[6].classList.contains('fc-sun')).toBeTruthy();
			expect(headers[7].classList.contains('fc-axis')).toBeTruthy();
		});
	});

});
