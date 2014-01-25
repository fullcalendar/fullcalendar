
var fc = $.fullCalendar = { version: "<%= meta.version %>" };
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
	
	this.each(function(i, _element) {
		var element = $(_element);
		var calendar = new Calendar(element, options);
		element.data('fullCalendar', calendar);
		calendar.render();
	});
	
	return this;
};


// function for adding/overriding defaults
function setDefaults(d) {
	mergeOptions(defaults, d);
}


// Recursively combines option hash-objects.
// Better than `$.extend(true, ...)` because arrays are not traversed/copied.
//
// called like:
//     mergeOptions(target, obj1, obj2, ...)
//
function mergeOptions(target) {
	for (var i=1; i<arguments.length; i++) {
		$.each(arguments[i], function(name, value) {
			if ($.isPlainObject(value) && $.isPlainObject(target[name]) && !isForcedAtomicOption(name)) {
				// merge into a new object to avoid destruction
				target[name] = mergeOptions({}, target[name], value); // combine. `value` object takes precedence
			}
			else if (value !== undefined) { // only use values that are set and not undefined
				target[name] = value;
			}
		});
	}
	return target;
}


// overcome sucky view-option-hash and option-merging behavior messing with options it shouldn't
function isForcedAtomicOption(name) {
	// Any option that ends in "Time" or "Duration" is probably a Duration,
	// and these will commonly be specified as plain objects, which we don't want to mess up.
	return /(Time|Duration)$/.test(name);
}
// FIX: find a different solution for view-option-hashes and have a whitelist
// for options that can be recursively merged.
