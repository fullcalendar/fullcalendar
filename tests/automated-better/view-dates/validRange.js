
fdescribe('validRange dates', function() {
	pushOptions({
		defaultDate: '2017-06-08'
	});

	// TODO: function that receives now date

	describe('when one week view', function() { // a view that has date-alignment by default
		pushOptions({
			defaultView: 'agendaWeek'
		});

		describe('when default range is partially before validRange', function() {
			pushOptions({
				validRange: { start: '2017-06-06' }
			});
		});

		describe('when default range is partially after validRange', function() {
			pushOptions({
				validRange: { end: '2017-06-05' }
			});
		});

		// when validRange shifts range

		describe('when default range is completely before validRange (which is week start)', function() {
			pushOptions({
				validRange: { start: '2017-06-11' }
			});
			it('displays the first week on or after validRange', function() {
				initCalendar();
				ViewDateUtils.expectVisibleRange('2017-06-11', '2017-06-18');
			});
		});

		describe('when range is completely before validRange (which is a Wednesday)', function() {
			pushOptions({
				validRange: { start: '2017-06-14' }
			});
			xit('displays the first week on or after validRange', function() {
				initCalendar();
				ViewDateUtils.expectVisibleRange('2017-06-11', '2017-06-18');
			});
		});

		describe('when range is completely after validRange (which is week start)', function() {
			pushOptions({
				validRange: { end: '2017-06-04' }
			});
			xit('displays the last week on or before validRange', function() {
				initCalendar();
				ViewDateUtils.expectVisibleRange('2017-05-28', '2017-06-04');
			});
		});

		describe('when range is completely after validRange (which is a Wednesday)', function() {
			pushOptions({
				validRange: { end: '2017-05-31' }
			});
			xit('displays the last week on or before validRange', function() {
				initCalendar();
				ViewDateUtils.expectVisibleRange('2017-05-28', '2017-06-04');
			});
		});
	});

	describe('when a three-day view', function() { // a view with no alignment
		pushOptions({
			defaultView: 'agenda',
			duration: { days: 3 }
		});

		// when there is no shifting

		describeOptions({
			'when no validRange': {},
			'when range is partially before validRange': { validRange: { start: '2017-06-09' } },
			'when range is partially after validRange': { validRange: { end: '2017-06-10' } }
		}, function() {

			xit('displays the whole range', function() {
				initCalendar();
				ViewDateUtils.expectVisibleRange('2017-06-08', '2017-06-11');
			});
		});

		// when validRange shifts range

		describe('when range is completely before of validRange (which is a Wednesday)', function() {
			pushOptions({
				validRange: { start: '2017-06-14' }
			});
			xit('displays the last full day as validRange', function() {
				initCalendar();
				ViewDateUtils.expectVisibleRange('2017-06-14', '2017-06-17');
			});
		});

		describe('when range is completely after validRange (which is a Wednesday)', function() {
			pushOptions({
				validRange: { end: '2017-05-31' }
			});
			xit('displays the first full date as validRange', function() {
				initCalendar();
				ViewDateUtils.expectVisibleRange('2017-05-31', '2017-06-03');
			});
		});
	});
});