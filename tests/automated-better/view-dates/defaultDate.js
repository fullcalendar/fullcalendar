/*
How a given defaultDate results in a rendered date range.

SEE ALSO:
- dateAlignment (how a custom view can force alignment)
- rangeComputation (how is interprets defaultDate differently)
*/
describe('defaultDate', function() {
	pushOptions({
		defaultDate: '2017-06-08'
	});

	describe('when one week view', function() { // a view that has date-alignment by default
		pushOptions({
			defaultView: 'agendaWeek'
		});

		// when there is no shifting

		describeOptions({
			'when no minDate/maxDate': {},
			'when range is partially before of minDate': { minDate: '2017-06-06' },
			'when range is partially after of maxDate': { maxDate: '2017-06-05' }
		}, function() {

			xit('displays the whole range', function() {
				initCalendar();
				ViewUtils.expectRange('2017-06-04', '2017-06-11');
			});
		});

		// when minDate/maxDate shifts range

		describe('when range is completely before of minDate (which is week start)', function() {
			pushOptions({
				minDate: '2017-06-11'
			});
			xit('displays the first week on or after minDate', function() {
				initCalendar();
				ViewUtils.expectRange('2017-06-11', '2017-06-18');
			});
		});

		describe('when range is completely before of minDate (which is a Wednesday)', function() {
			pushOptions({
				minDate: '2017-06-14'
			});
			xit('displays the first week on or after minDate', function() {
				initCalendar();
				ViewUtils.expectRange('2017-06-11', '2017-06-18');
			});
		});

		describe('when range is completely after of maxDate (which is week start)', function() {
			pushOptions({
				maxDate: '2017-06-04'
			});
			xit('displays the last week on or before maxDate', function() {
				initCalendar();
				ViewUtils.expectRange('2017-05-28', '2017-06-04');
			});
		});

		describe('when range is completely after of maxDate (which is a Wednesday)', function() {
			pushOptions({
				maxDate: '2017-05-31'
			});
			xit('displays the last week on or before maxDate', function() {
				initCalendar();
				ViewUtils.expectRange('2017-05-28', '2017-06-04');
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
			'when no minDate/maxDate': {},
			'when range is partially before of minDate': { minDate: '2017-06-09' },
			'when range is partially after of maxDate': { maxDate: '2017-06-10' }
		}, function() {

			xit('displays the whole range', function() {
				initCalendar();
				ViewUtils.expectRange('2017-06-08', '2017-06-11');
			});
		});

		// when minDate/maxDate shifts range

		describe('when range is completely before of minDate (which is a Wednesday)', function() {
			pushOptions({
				minDate: '2017-06-14'
			});
			xit('displays the last full day as minDate', function() {
				initCalendar();
				ViewUtils.expectRange('2017-06-14', '2017-06-17');
			});
		});

		describe('when range is completely after of maxDate (which is a Wednesday)', function() {
			pushOptions({
				maxDate: '2017-05-31'
			});
			xit('displays the first full date as maxDate', function() {
				initCalendar();
				ViewUtils.expectRange('2017-05-31', '2017-06-03');
			});
		});
	});
});