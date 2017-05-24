
var FuncEventSource = EventSource.extend({

	func: null,


	fetch: function(start, end, timezone) {
		var _this = this;

		return Promise.construct(function(onResolve) {
			this.func.call(
				this.calendar,
				start.clone(),
				end.clone(),
				timezone,
				function(rawEventDefs) {
					onResolve(_this.parseEventDefs(rawEventDefs));
				}
			);
		});
	},


	getPrimitive: function() {
		return this.func;
	}

});


FuncEventSource.parse = function(rawInput, calendar) {
	var func;
	var rawOtherProps;
	var source;

	if ($.isFunction(rawInput)) {
		func = rawInput;
		rawOtherProps = {};
	}
	else if ($.isFunction(rawInput.events)) {
		rawOtherProps = $.extend({}, rawInput); // copy
		func = pluckProp(rawOtherProps, 'events');
	}

	if (func) {
		source = EventSource.parseAndPluck.call(this, rawOtherProps, calendar);
		source.func = func;

		return source;
	}
};


EventSourceParser.registerClass(FuncEventSource);

FC.FuncEventSource = FuncEventSource;
