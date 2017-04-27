
describe('dayCount', function() {
	pushOptions({
		defaultDate: '2017-03-15', // wed
		weekends: false
	});

	describeOptions({
		'when specified as top-level options': {
			defaultView: 'basic',
			dayCount: 5
		},
		'when specified as custom view': {
			views: {
				myCustomView: {
					type: 'basic',
					dayCount: 5
				}
			},
			defaultView: 'myCustomView'
		}
	}, function() {
		it('renders the exact day count', function() {
			initCalendar();
			ViewDateUtils.expectActiveRange('2017-03-15', '2017-03-22');
			ViewRenderUtils.expectDay('2017-03-15', true);
			ViewRenderUtils.expectDay('2017-03-16', true);
			ViewRenderUtils.expectDay('2017-03-17', true);
			ViewRenderUtils.expectDay('2017-03-18', false); // sat
			ViewRenderUtils.expectDay('2017-03-19', false); // sun
			ViewRenderUtils.expectDay('2017-03-20', true);
			ViewRenderUtils.expectDay('2017-03-21', true);
		});
	});

	it('can span multiple weeks', function() {
		initCalendar({
			defaultView: 'agenda',
			dayCount: 9
		});
		ViewDateUtils.expectActiveRange('2017-03-15', '2017-03-28');
		ViewRenderUtils.expectDay('2017-03-15', true);
		ViewRenderUtils.expectDay('2017-03-16', true);
		ViewRenderUtils.expectDay('2017-03-17', true);
		ViewRenderUtils.expectDay('2017-03-18', false); // sat
		ViewRenderUtils.expectDay('2017-03-19', false); // sun
		ViewRenderUtils.expectDay('2017-03-20', true);
		ViewRenderUtils.expectDay('2017-03-21', true);
		ViewRenderUtils.expectDay('2017-03-22', true);
		ViewRenderUtils.expectDay('2017-03-23', true);
		ViewRenderUtils.expectDay('2017-03-24', true);
		ViewRenderUtils.expectDay('2017-03-25', false); // sat
		ViewRenderUtils.expectDay('2017-03-26', false); // sun
		ViewRenderUtils.expectDay('2017-03-27', true);
	});
});
