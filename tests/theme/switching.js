
describe('theme switching', function() {

	it('can switch from standard to jquery-ui', function() {
		initCalendar();
		verifyStandardTheme();
		currentCalendar.option('theme', 'jquery-ui');
		verifyJqueryUiTheme();
	});

	it('can switch from jquery-ui to boostrap3', function() {
		initCalendar({ theme: 'jquery-ui' });
		verifyJqueryUiTheme();
		currentCalendar.option('theme', 'bootstrap3');
		verifyBootstrapTheme();
	});


	function verifyStandardTheme() {
		expect($('.fc-unthemed')).toBeInDOM();
		expect($('.fc-widget-header')).toBeInDOM();
	}

	function verifyJqueryUiTheme() {
		expect($('.fc.ui-widget')).toBeInDOM();
		expect($('.ui-widget-header')).toBeInDOM();
	}

	function verifyBootstrapTheme() {
		expect($('.fc-bootstrap3')).toBeInDOM();
		expect($('.fc .table-bordered')).toBeInDOM();
	}

});
