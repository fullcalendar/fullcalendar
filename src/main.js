
var fc = $.fullCalendar = { version: "@VERSION" };
var fcViews = fc.views = {};


$.fn.fullCalendar = function(options) {


	// method calling
	if (typeof options == 'string') {
		var args = Array.prototype.slice.call(arguments, 1);
		var res;
		this.each(function() {
			var calendar = $.data(this, 'fullCalendar');
			if (calendar && $.isFunction(calendar[options])) {
				var r = calendar[options].apply(calendar, args);
				if (res === undefined) {
					res = r;
				}
				if (options == 'destroy') {
					$.removeData(this, 'fullCalendar');
				}
			}
		});
		if (res !== undefined) {
			return res;
		}
		return this;
	}
	
	
	// would like to have this logic in EventManager, but needs to happen before options are recursively extended
	var eventSources = options.eventSources || [];
	delete options.eventSources;
	if (options.events) {
		eventSources.push(options.events);
		delete options.events;
	}
	

	options = $.extend(true, {},
		defaults,
		(options.isRTL || options.isRTL===undefined && defaults.isRTL) ? rtlDefaults : {},
		options
	);
	
	
	this.each(function(i, _element) {
		var element = $(_element);
		var calendar = new Calendar(element, options, eventSources);
		element.data('fullCalendar', calendar); // TODO: look into memory leak implications
		calendar.render();
	});
	
	
	return this;
	
};

$.extend($.expr[":"], {
  "cell-date": function(element, i, match, array) {
    var exprDate = "" + match[3];
    var cellDate = $(element).data("cell-date");
    var day = cellDate.getDate();
    var month = cellDate.getMonth() + 1;
    var year = cellDate.getFullYear();
    // Match mm-dd-yyy
    var matchResult = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(exprDate) || /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(exprDate);
    if (matchResult) {
      return month == parseInt(matchResult[1], 10) && day == parseInt(matchResult[2], 10) && year == matchResult[3];
    }
    // Match yyyy-mm-dd
    matchResult = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(exprDate) || /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(exprDate);
    if (matchResult) {
      return month == parseInt(matchResult[2], 10) && day == parseInt(matchResult[3], 10) && year == matchResult[1];
    }
    // Match timestamps
    return +cellDate == exprDate;
  }
});

// function for adding/overriding defaults
function setDefaults(d) {
	$.extend(true, defaults, d);
}


