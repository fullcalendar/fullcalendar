
fcViews.resourceDay = ResourceDayView;


function ResourceDayView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	ResourceView.call(t, element, calendar, 'resourceDay');
	var opt = t.opt;
	var renderResource = t.renderResource;
	var skipHiddenDays = t.skipHiddenDays;
	var formatDate = calendar.formatDate;
	var getResources = t.getResources;
	
	
	function render(date, delta) {

		if (delta) {
			addDays(date, delta);
		}
		skipHiddenDays(date, delta < 0 ? -1 : 1);

		var start = cloneDate(date, true);
		var end = addDays(cloneDate(start), 1);

		t.title = formatDate(date, opt('titleFormat'));

		t.start = t.visStart = start;
		t.end = t.visEnd = end;

		renderResource(getResources().length);
	}
	

}