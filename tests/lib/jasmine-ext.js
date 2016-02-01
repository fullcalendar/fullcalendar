
beforeEach(function() {

	// don't show warnings about deprecated methods like `moment.lang`, etc.
	// at some point we'll require moment version above 2.8.
	// until then, it's too annoying to support two versions.
	// (not the best place for this)
	moment.suppressDeprecationWarnings = true;

	jasmine.addMatchers({

		// Moment and Duration

		toEqualMoment: function() {
			return {
				compare: function(actual, expected) {
					var actualStr = $.fullCalendar.moment.parseZone(actual).format();
					var expectedStr = $.fullCalendar.moment.parseZone(expected).format();
					var result = {
						pass: actualStr === expectedStr
					};
					if (!result.pass) {
						result.message = 'Moment ' + actualStr + ' does not equal ' + expectedStr;
					}
					return result;
				}
			};
		},
		toEqualNow: function() {
			return {
				compare: function(actual) {
					var actualMoment = $.fullCalendar.moment.parseZone(actual);
					var result = {
						pass: Math.abs(actualMoment - new Date()) < 1000 // within a second of current datetime
					};
					if (!result.pass) {
						result.message = 'Moment ' + actualMoment.format() + ' is not close enough to now';
					}
					return result;
				}
			};
		},
		toEqualDuration: function() {
			return {
				compare: function(actual, expected) {
					var actualStr = serializeDuration(moment.duration(actual));
					var expectedStr = serializeDuration(moment.duration(expected));
					var result = {
						pass: actualStr === expectedStr
					};
					if (!result.pass) {
						result.message = 'Duration ' + actualStr + ' does not equal ' + expectedStr;
					}
					return result;
				}
			};
		},


		// DOM

		toHaveScrollbars: function() {
			return {
				compare: function(actual) {
					var elm = $(actual);
					var result = {
						pass: elm[0].scrollWidth - 1 > elm[0].clientWidth || // -1 !!!
							elm[0].scrollHeight - 1 > elm[0].clientHeight // -1 !!!
					};
					// !!! - IE was reporting a scrollWidth/scrollHeight 1 pixel taller than what it was :(
					return result;
				}
			};
		},


		// Geometry

		toBeBoundedBy: function() {
			return {
				compare: function(actual, expected) {
					var outer = getBounds(expected);
					var inner = getBounds(actual);
					var result = {
						pass: outer && inner &&
							inner.left >= outer.left &&
							inner.right <= outer.right &&
							inner.top >= outer.top &&
							inner.bottom <= outer.bottom
					};
					if (!result.pass) {
						result.message = 'Element does not bound other element';
					}
					return result;
				}
			};
		},
		toBeLeftOf: function() {
			return {
				compare: function(actual, expected) {
					var subjectBounds = getBounds(actual);
					var otherBounds = getBounds(expected);
					var result = {
						pass: subjectBounds && otherBounds &&
							Math.round(subjectBounds.right) <= Math.round(otherBounds.left)
							// need to round because IE was giving weird fractions
					};
					if (!result.pass) {
						result.message = 'Element is not to the left of the other element';
					}
					return result;
				}
			};
		},
		toBeRightOf: function() {
			return {
				compare: function(actual, expected) {
					var subjectBounds = getBounds(actual);
					var otherBounds = getBounds(expected);
					var result = {
						pass: subjectBounds && otherBounds &&
							Math.round(subjectBounds.left) >= Math.round(otherBounds.right)
							// need to round because IE was giving weird fractions
					};
					if (!result.pass) {
						result.message = 'Element is not to the right of the other element';
					}
					return result;
				}
			};
		},
		toBeAbove: function() {
			return {
				compare: function(actual, expected) {
					var subjectBounds = getBounds(actual);
					var otherBounds = getBounds(expected);
					var result = {
						pass: subjectBounds && otherBounds &&
							Math.round(subjectBounds.bottom) <= Math.round(otherBounds.top)
							// need to round because IE was giving weird fractions
					};
					if (!result.pass) {
						result.message = 'Element is not above the other element';
					}
					return result;
				}
			};
		},
		toBeBelow: function() {
			return {
				compare: function(actual, expected) {
					var subjectBounds = getBounds(actual);
					var otherBounds = getBounds(expected);
					var result = {
						pass: subjectBounds && otherBounds &&
							Math.round(subjectBounds.top) >= Math.round(otherBounds.bottom)
							// need to round because IE was giving weird fractions
					};
					if (!result.pass) {
						result.message = 'Element is not below the other element';
					}
					return result;
				}
			};
		},
		toIntersectWith: function() {
			return {
				compare: function(actual, expected) {
					var subjectBounds = getBounds(actual);
					var otherBounds = getBounds(expected);
					var result = {
						pass: subjectBounds && otherBounds &&
							subjectBounds.right > otherBounds.left &&
							subjectBounds.left < otherBounds.right &&
							subjectBounds.bottom > otherBounds.top &&
							subjectBounds.top < otherBounds.bottom
					};
					if (!result.pass) {
						result.message = 'Element does not intersect with other element';
					}
					return result;
				}
			};
		}

	});

	function serializeDuration(duration) {
		return Math.floor(duration.asDays()) + '.' +
			pad(duration.hours(), 2) + ':' +
			pad(duration.minutes(), 2) + ':' +
			pad(duration.seconds(), 2) + '.' +
			pad(duration.milliseconds(), 3);
	}

	function pad(n, width) {
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
	}

	function getBounds(node) {
		var el = $(node);
		var offset = el.offset();

		if (!offset) {
			return false;
		}

		return {
			top: offset.top,
			left: offset.left,
			right: offset.left + el.outerWidth(),
			bottom: offset.top + el.outerHeight()
		};
	}

});

// Destroy the calendar afterwards, to prevent memory leaks
// (not the best place for this)
afterEach(function() {
	$('#calendar,#cal').fullCalendar('destroy'); // common id's for calendars in tests
});
