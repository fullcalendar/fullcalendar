
var fc = $.fullCalendar = { version: "<%= meta.version %>" };
var fcViews = fc.views = {};


$.fn.fullCalendar = function(options) {
	var args = Array.prototype.slice.call(arguments, 1); // for a possible method call
	var res = this; // what this function will return (this jQuery object by default)

	this.each(function(i, _element) { // loop each DOM element involved
		var element = $(_element);
		var calendar = element.data('fullCalendar'); // get the existing calendar object (if any)
		var singleRes; // the returned value of this single method call

		// a method call
		if (typeof options === 'string') {
			if (calendar && $.isFunction(calendar[options])) {
				singleRes = calendar[options].apply(calendar, args);
				if (!i) {
					res = singleRes; // record the first method call result
				}
				if (options === 'destroy') { // for the destroy method, must remove Calendar object data
					element.removeData('fullCalendar');
				}
			}
		}
		// a new calendar initialization
		else if (!calendar) { // don't initialize twice
			calendar = new fc.CalendarBase(element, options);
			element.data('fullCalendar', calendar);
			calendar.render();
		}
	});
	
	return res;
};


var complexOptions = [ // names of options that are objects whose properties should be combined
	'header',
	'buttonText',
	'buttonIcons',
	'themeButtonIcons'
];


// Recursively combines all passed-in option-hash arguments into a new single option-hash.
// Given option-hashes are ordered from lowest to highest priority.
function mergeOptions() {
	var chain = Array.prototype.slice.call(arguments); // convert to a real array
	var complexVals = {}; // hash for each complex option's combined values
	var i, name;
	var combinedVal;
	var j;
	var val;

	// for each complex option, loop through each option-hash and accumulate the combined values
	for (i = 0; i < complexOptions.length; i++) {
		name = complexOptions[i];
		combinedVal = null; // an object holding the merge of all the values

		for (j = 0; j < chain.length; j++) {
			val = chain[j][name];

			if ($.isPlainObject(val)) {
				combinedVal = $.extend(combinedVal || {}, val); // merge new properties
			}
			else if (val != null) { // a non-null non-undefined atomic option
				combinedVal = null; // signal to use the atomic value
			}
		}

		// if not null, the final value was a combination of other objects. record it
		if (combinedVal !== null) {
			complexVals[name] = combinedVal;
		}
	}

	chain.unshift({}); // $.extend will mutate this with the result
	chain.push(complexVals); // computed complex values are applied last
	return $.extend.apply($, chain); // combine
}


// Given options specified for the calendar's constructor, massages any legacy options into a non-legacy form.
// Converts View-Option-Hashes into the View-Specific-Options format.
function massageOverrides(input) {
	var overrides = { views: input.views || {} }; // the output. ensure a `views` hash
	var subObj;

	// iterate through all option override properties (except `views`)
	$.each(input, function(name, val) {
		if (name != 'views') {

			// could the value be a legacy View-Option-Hash?
			if (
				$.isPlainObject(val) &&
				!/(time|duration|interval)$/i.test(name) && // exclude duration options. might be given as objects
				$.inArray(name, complexOptions) == -1 // complex options aren't allowed to be View-Option-Hashes
			) {
				subObj = null;

				// iterate through the properties of this possible View-Option-Hash value
				$.each(val, function(subName, subVal) {

					// is the property targeting a view?
					if (/^(month|week|day|default|basic(Week|Day)?|agenda(Week|Day)?)$/.test(subName)) {
						if (!overrides.views[subName]) { // ensure the view-target entry exists
							overrides.views[subName] = {};
						}
						overrides.views[subName][name] = subVal; // record the value in the `views` object
					}
					else { // a non-View-Option-Hash property
						if (!subObj) {
							subObj = {};
						}
						subObj[subName] = subVal; // accumulate these unrelated values for later
					}
				});

				if (subObj) { // non-View-Option-Hash properties? transfer them as-is
					overrides[name] = subObj;
				}
			}
			else {
				overrides[name] = val; // transfer normal options as-is
			}
		}
	});

	return overrides;
}
