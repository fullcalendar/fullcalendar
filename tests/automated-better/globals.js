
// Jasmine Enhancements
// ---------------------------------------------------------------------------------------------------------------------

/*
Give it/fit the ability to return promises
*/
[ 'it', 'fit' ].forEach(function(funcName) {
	var origFunc = window[funcName];

	window[funcName] = function(description, runFunc) {
		origFunc(description, function(done) {
			var res = runFunc(done);
			if (res && res.then) {
				res.then(done);
			}
			else {
				done();
			}
		});
	};
});


// Setup / Teardown
// ---------------------------------------------------------------------------------------------------------------------

var optionsStack = null;
var currentCalendar = null;


beforeEach(function() {
	optionsStack = [];
});

afterEach(function() {
	optionsStack = null;
	if (currentCalendar) {
		currentCalendar.destroy();
		currentCalendar = null;
	}
	$('#calendar').remove();
});


// Calendar Options and Initialization
// ---------------------------------------------------------------------------------------------------------------------

function pushOptions(options) {
	beforeEach(function() {
		return optionsStack.push(options);
	});
}

function initCalendar(options, el) {
	var Calendar = $.fullCalendar.Calendar;
	var $el;

	if (options) {
		optionsStack.push(options);
	}

	if (el) {
		$el = $(el);
	}
	else {
		$el = $('<div id="calendar">').appendTo('body');
	}

	currentCalendar = new Calendar($el, getCurrentOptions()); // set the global

	return currentCalendar.render();
}

function getCurrentOptions() {
	return $.extend.apply($, [ {} ].concat(optionsStack));
}


// Categorizing Tests
// ---------------------------------------------------------------------------------------------------------------------

/*
describeOptions(optionName, descriptionAndValueHash, callback)
describeOptions(descriptionAndOptionsHash, callback)
 */
function describeOptions(optName, hash, callback) {
	if ($.type(optName) === 'object') {
		callback = hash;
		hash = optName;
		optName = null;
	}

	$.each(hash, function(desc, val) {
		var opts;

		if (optName) {
			opts = {};
			opts[optName] = val;
		}
		else {
			opts = val;
		}
		opts = $.extend(true, {}, opts);

		describe(desc, function() {
			pushOptions(opts);
			callback(val);
		});
	});
}

function describeValues(hash, callback) {
	$.each(hash, function(desc, val) {
		describe(desc, function() {
			callback(val);
		});
	});
}


// Timezone Tests (needed?)
// ---------------------------------------------------------------------------------------------------------------------

var timezoneScenarios = {
	none: {
		description: 'when no timezone',
		value: null,
		moment: function(str) {
			return $.fullCalendar.moment.parseZone(str);
		}
	},
	local: {
		description: 'when local timezone',
		value: 'local',
		moment: function(str) {
			return moment(str);
		}
	},
	UTC: {
		description: 'when UTC timezone',
		value: 'UTC',
		moment: function(str) {
			return moment.utc(str);
		}
	}
};

function describeTimezones(callback) {
	$.each(timezoneScenarios, function(name, scenario) {
		describe(scenario.description, function() {
			pushOptions({
				timezone: name
			});
			callback(scenario);
		});
	});
}

function describeTimezone(name, callback) {
	var scenario = timezoneScenarios[name];

	describe(scenario.description, function() {
		pushOptions({
			timezone: name
		});
		callback(scenario);
	});
}


// Misc
// ---------------------------------------------------------------------------------------------------------------------

function isElWithinRtl(el) {
	return el.closest('.fc').hasClass('fc-rtl');
}

function oneCall(func) {
	var called;
	called = false;
	return function() {
		if (!called) {
			called = true;
			return func.apply(this, arguments);
		}
	};
}
